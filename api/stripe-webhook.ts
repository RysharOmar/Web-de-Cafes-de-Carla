/**
 * Función serverless de Vercel: POST /api/stripe-webhook
 *
 * Recibe el evento `checkout.session.completed` de Stripe, valida la firma
 * con STRIPE_WEBHOOK_SECRET sobre el cuerpo raw y guarda el pedido a domicilio
 * en la tabla `orders` de Neon.
 *
 * La sesión de checkout se marca con metadata.tipo = 'delivery' cuando el
 * pedido se hace desde la carta principal. Los pagos de mesa (metadata
 * 'mesa') se ignoran: esos pedidos viven en localStorage y no van a Neon.
 */
import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

// Imprescindible para poder verificar la firma: Stripe necesita el body exacto.
export const config = {
  api: {
    bodyParser: false,
  },
};

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const sql = neon(process.env.DATABASE_URL!);

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

function joinAddress(address: Stripe.Address | null | undefined): string | null {
  if (!address) return null;

  const cityLine = [address.postal_code, address.city].filter(Boolean).join(' ');
  return [address.line1, address.line2, cityLine, address.state, address.country]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(', ') || null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    process.stderr.write('Stripe webhook: faltan variables de entorno\n');
    res.status(500).json({ error: 'Webhook no configurado' });
    return;
  }

  const signature = req.headers['stripe-signature'] as string | undefined;
  if (!signature) {
    res.status(400).json({ error: 'Falta la firma de Stripe' });
    return;
  }

  let rawBody: string;
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    rawBody = Buffer.concat(chunks).toString('utf8');
  } catch {
    res.status(400).json({ error: 'No se pudo leer el cuerpo del webhook' });
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    process.stderr.write(`Firma de webhook inválida: ${err?.message ?? err}\n`);
    res.status(400).json({ error: 'Firma de webhook inválida' });
    return;
  }

  if (event.type !== 'checkout.session.completed') {
    res.status(200).json({ received: true, ignored: event.type });
    return;
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Los pagos de mesa no se registran en Neon (usan localStorage).
  if (session.metadata?.tipo !== 'delivery') {
    res.status(200).json({ received: true, ignored: 'not-delivery' });
    return;
  }

  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 100,
      expand: ['data.price.product'],
    });

    const items = lineItems.data.map((line) => {
      const product = line.price?.product as Stripe.Product | string | null | undefined;
      const productObject = product && typeof product === 'object' ? product : null;
      const productId = productObject?.id ?? (typeof product === 'string' ? product : null);

      return {
        id: productId,
        name: productObject?.name || line.description || 'Producto',
        descripcion: line.description ?? null,
        quantity: line.quantity ?? 1,
        unitAmountCents: line.price?.unit_amount ?? null,
        amountTotalCents: line.amount_total ?? 0,
      };
    });

    const customer = session.customer_details;
    const shipping = session.shipping_details;

    const inserted = await sql`
      INSERT INTO orders (
        stripe_session_id,
        tipo,
        mesa,
        cliente_nombre,
        cliente_email,
        cliente_telefono,
        direccion_envio,
        total,
        items,
        estado
      )
      VALUES (
        ${session.id},
        'delivery',
        NULL,
        ${customer?.name ?? null},
        ${customer?.email ?? null},
        ${customer?.phone ?? null},
        ${joinAddress(shipping?.address)},
        ${session.amount_total != null ? session.amount_total / 100 : null},
        ${JSON.stringify(items)}::jsonb,
        'pendiente'
      )
      ON CONFLICT (stripe_session_id) DO NOTHING
      RETURNING id
    `;

    const duplicated = !Array.isArray(inserted) || inserted.length === 0;
    res.status(200).json({
      received: true,
      duplicated,
      orderId: duplicated ? null : (inserted[0] as { id: number }).id,
    });
  } catch (err: any) {
    const message = err?.message ? String(err.message) : String(err);
    process.stderr.write(`Error guardando pedido delivery: ${message}\n`);
    // Respondemos 200 para que Stripe no reintente indefinidamente un error de datos.
    res.status(200).json({ received: true, error: 'No se pudo guardar el pedido' });
  }
}
