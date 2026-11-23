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

const RAW_STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const RAW_STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const sql = neon(process.env.DATABASE_URL!);

function cleanStripeKey(value: string): string | null {
  let trimmed = value.trim();
  if (!trimmed) return null;
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
  }
  return /^(sk|rk)_(test|live)_[A-Za-z0-9]+$/.test(trimmed) ? trimmed : null;
}

function cleanWebhookSecret(value: string): string | null {
  let trimmed = value.trim();
  if (!trimmed) return null;
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
  }
  return trimmed.startsWith('whsec_') ? trimmed : null;
}

const STRIPE_SECRET_KEY = cleanStripeKey(RAW_STRIPE_SECRET_KEY);
const STRIPE_WEBHOOK_SECRET = cleanWebhookSecret(RAW_STRIPE_WEBHOOK_SECRET);
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

console.log('[stripe-webhook] Módulo cargado', {
  hasStripeSecretKey: Boolean(STRIPE_SECRET_KEY),
  rawStripeKeyPrefix: RAW_STRIPE_SECRET_KEY.trim().slice(0, 12) || null,
  hasWebhookSecret: Boolean(STRIPE_WEBHOOK_SECRET),
  hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
  bodyParser: 'desactivado (config.api.bodyParser = false)',
});

function joinAddress(address: Stripe.Address | null | undefined): string | null {
  if (!address) return null;

  const cityLine = [address.postal_code, address.city].filter(Boolean).join(' ');
  return [address.line1, address.line2, cityLine, address.state, address.country]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(', ') || null;
}

function mapStripeLineItems(lineItems: any) {
  return (lineItems?.data ?? []).map((line: any) => {
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
}

export default async function handler(req: any, res: any) {
  console.log('[stripe-webhook] Petición recibida', {
    method: req.method,
    url: req.url,
    hasSignature: Boolean(req.headers['stripe-signature']),
  });

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    console.error('[stripe-webhook] Faltan variables de entorno', {
      hasStripeSecretKey: Boolean(STRIPE_SECRET_KEY),
      hasWebhookSecret: Boolean(STRIPE_WEBHOOK_SECRET),
    });
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
    console.log('[stripe-webhook] Body raw leído', { bytes: Buffer.byteLength(rawBody, 'utf8') });
  } catch (err: any) {
    console.error('[stripe-webhook] Error leyendo el body raw', err?.message ?? err);
    res.status(400).json({ error: 'No se pudo leer el cuerpo del webhook' });
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
    console.log('[stripe-webhook] Firma validada correctamente', {
      eventId: event.id,
      type: event.type,
    });
  } catch (err: any) {
    console.error('[stripe-webhook] Firma inválida', {
      message: err?.message ?? String(err),
      signatureStart: signature.slice(0, 20),
    });
    process.stderr.write(`Firma de webhook inválida: ${err?.message ?? err}\n`);
    res.status(400).json({ error: 'Firma de webhook inválida' });
    return;
  }

  if (event.type !== 'checkout.session.completed') {
    console.log('[stripe-webhook] Evento ignorado por tipo', { type: event.type });
    res.status(200).json({ received: true, ignored: event.type });
    return;
  }

  const session = event.data.object as Stripe.Checkout.Session;

  console.log('[stripe-webhook] Sesión de checkout recibida', {
    sessionId: session.id,
    paymentStatus: session.payment_status,
    amountTotal: session.amount_total,
    metadata: session.metadata ?? null,
  });

  const sessionType = session.metadata?.tipo;

  // Pago de mesa: Stripe confirma el cobro y lo registramos en Neon. La cocina
  // consultará este registro para marcar la mesa como PAGADA en su localStorage.
  if (sessionType === 'mesa') {
    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        limit: 100,
        expand: ['data.price.product'],
      });
      const items = mapStripeLineItems(lineItems);
      const mesa = session.metadata?.mesa ?? null;
      const total = session.amount_total != null ? session.amount_total / 100 : null;

      console.log('[stripe-webhook] Confirmación de pago de mesa recibida', {
        sessionId: session.id,
        mesa,
        total,
        itemsCount: items.length,
      });

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
          'mesa',
          ${mesa},
          NULL,
          NULL,
          NULL,
          NULL,
          ${total},
          ${JSON.stringify(items)}::jsonb,
          'pagado'
        )
        ON CONFLICT (stripe_session_id) DO NOTHING
        RETURNING id
      `;

      const insertedRows = Array.isArray(inserted) ? inserted : [];
      console.log('[stripe-webhook] Pago de mesa guardado en Neon', {
        orderId: insertedRows.length ? (insertedRows[0] as { id: number }).id : null,
        duplicated: insertedRows.length === 0,
      });

      res.status(200).json({ received: true, tipo: 'mesa', mesa });
    } catch (err: any) {
      const message = err?.message ? String(err.message) : String(err);
      console.error('[stripe-webhook] Error guardando pago de mesa', {
        message,
        sessionId: session.id,
        stack: err?.stack ?? null,
      });
      res.status(500).json({ error: 'No se pudo registrar el pago de la mesa', detail: message });
    }
    return;
  }

  if (sessionType !== 'delivery') {
    console.log('[stripe-webhook] Evento ignorado: metadata sin tipo reconocido', {
      sessionId: session.id,
      metadata: session.metadata ?? null,
    });
    res.status(200).json({ received: true, ignored: 'unknown-type' });
    return;
  }

  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 100,
      expand: ['data.price.product'],
    });

    const items = mapStripeLineItems(lineItems);

    const customer = session.customer_details;
    const shipping = session.shipping_details;

    // Checkout con shipping_address_collection rellena shipping_details, pero
    // sesiones antiguas o pagos sin envío pueden traer solo customer_details.address.
    const direccionEnvio = joinAddress(shipping?.address) ?? joinAddress(customer?.address);

    console.log('[stripe-webhook] Dirección de envío resuelta', {
      hasShippingDetails: Boolean(shipping),
      hasShippingAddress: Boolean(shipping?.address),
      hasCustomerAddress: Boolean(customer?.address),
      direccionEnvio,
    });

    const total = session.amount_total != null ? session.amount_total / 100 : null;

    const payload = {
      stripe_session_id: session.id,
      cliente_nombre: customer?.name ?? null,
      cliente_email: customer?.email ?? null,
      cliente_telefono: customer?.phone ?? null,
      direccion_envio: direccionEnvio,
      total,
      items,
      itemsCount: items.length,
      estado: 'pendiente',
    };

    console.log('[stripe-webhook] Datos que se van a insertar en orders', JSON.stringify(payload));

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
        ${payload.stripe_session_id},
        'delivery',
        NULL,
        ${payload.cliente_nombre},
        ${payload.cliente_email},
        ${payload.cliente_telefono},
        ${payload.direccion_envio},
        ${payload.total},
        ${JSON.stringify(payload.items)}::jsonb,
        ${payload.estado}
      )
      ON CONFLICT (stripe_session_id) DO NOTHING
      RETURNING id
    `;

    const insertedRows = Array.isArray(inserted) ? inserted : [];
    const duplicated = insertedRows.length === 0;
    const orderId = duplicated ? null : (insertedRows[0] as { id: number }).id;

    console.log('[stripe-webhook] INSERT en orders terminado', {
      orderId,
      duplicated,
      insertedRows: insertedRows.length,
    });

    res.status(200).json({ received: true, duplicated, orderId });
  } catch (err: any) {
    const message = err?.message ? String(err.message) : String(err);
    console.error('[stripe-webhook] Error insertando el pedido en orders', {
      message,
      sessionId: session.id,
      stack: err?.stack ?? null,
    });
    process.stderr.write(`Error guardando pedido delivery: ${message}\n`);
    // 500 para que Stripe muestre el fallo y reintente; el UNIQUE(evitado con
    // ON CONFLICT) impide duplicar pedidos si el reintento llega a insertar.
    res.status(500).json({ error: 'No se pudo guardar el pedido', detail: message });
  }
}
