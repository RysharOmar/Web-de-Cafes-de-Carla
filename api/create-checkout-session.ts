/**
 * Función serverless de Vercel: POST /api/create-checkout-session
 * Crea una sesión de Stripe Checkout.
 *
 * Los precios, nombres, descripciones y la disponibilidad se resuelven
 * siempre en el servidor consultando la tabla `products` de Neon.
 * Cualquier `priceCents` que envíe el navegador se ignora.
 */
import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

type CartItem = {
  id: string | number;
  quantity: number;
  sizeLabel?: string;
  variant?: string;
};

type CheckoutBody = {
  items?: CartItem[];
  /** 'delivery' para pedidos de la carta; 'mesa' para pagos en el local. */
  tipo?: 'delivery' | 'mesa';
};

type ProductoRow = {
  id: number;
  nombre: string;
  precio: string | number;
  precio_mini: string | number | null;
  precio_grande: string | number | null;
  categoria: string;
  agotado: boolean;
  descripcion: string | null;
};

type SizeLabel = 'Mini' | 'Normal' | 'Grande';

function normalizeSize(value: unknown): SizeLabel {
  if (value === 'Mini' || value === 'Grande') return value;
  return 'Normal';
}

/** En Cereales las tallas internas Mini/Normal/Grande se muestran como S/M/L. */
function displaySizeName(categoria: string, size: SizeLabel): string {
  if (categoria?.trim().toLocaleLowerCase('es') !== 'cereales') return size;
  return size === 'Mini' ? 'S' : size === 'Grande' ? 'L' : 'M';
}

function priceForSize(producto: ProductoRow, size: SizeLabel): number | null {
  const raw = size === 'Mini'
    ? producto.precio_mini
    : size === 'Grande'
      ? producto.precio_grande
      : producto.precio;

  if (raw === null || raw === undefined || raw === '') return null;
  const euros = Number(raw);
  if (!Number.isFinite(euros)) return null;
  return Math.round(euros * 100);
}

function cleanStripeKey(value: string | undefined): string | null {
  let trimmed = value?.trim();
  if (!trimmed) return null;

  // Vercel a veces guarda comillas literalmente en el valor del secreto.
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
  }

  // Claves estándar (sk_) o restringidas (rk_), en modo test o live.
  if (!/^(sk|rk)_(test|live)_[A-Za-z0-9]+$/.test(trimmed)) return null;
  return trimmed;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const rawEnvSecret = process.env.STRIPE_SECRET_KEY;
  const stripeSecret = cleanStripeKey(rawEnvSecret);

  if (!stripeSecret) {
    // Nunca caemos a una clave de demo: las sesiones creadas con otra cuenta
    // no llegan al webhook del cliente.
    console.error('[checkout] STRIPE_SECRET_KEY no válida', {
      configured: Boolean(rawEnvSecret),
      rawPrefix: rawEnvSecret?.trim().slice(0, 12) ?? null,
      rawLength: rawEnvSecret?.length ?? 0,
    });
    res.status(500).json({
      error: 'STRIPE_SECRET_KEY no configurada o con formato inválido en Vercel',
    });
    return;
  }

  try {
    const stripe = new Stripe(stripeSecret);
    const { items, tipo } = (req.body ?? {}) as CheckoutBody;
    const isDelivery = tipo === 'delivery';

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Carrito vacío' });
      return;
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of items) {
      const productId = Number(item.id);
      const quantity = Math.max(1, Math.min(99, Math.floor(Number(item.quantity || 1))));
      const size = normalizeSize(item.sizeLabel);

      if (!Number.isInteger(productId) || productId <= 0) {
        res.status(400).json({ error: `ID de producto no válido: ${item.id}` });
        return;
      }

      const rows = await sql`
        SELECT id, nombre, precio, precio_mini, precio_grande, categoria, agotado, descripcion
        FROM products
        WHERE id = ${productId}
        LIMIT 1
      `;

      if (rows.length === 0) {
        res.status(400).json({ error: `Producto no encontrado: ${productId}` });
        return;
      }

      const producto = rows[0] as ProductoRow;

      if (producto.agotado) {
        res.status(400).json({ error: `Producto agotado: ${producto.nombre}` });
        return;
      }

      const unitAmount = priceForSize(producto, size);
      const sizeName = displaySizeName(producto.categoria, size);

      if (unitAmount === null || unitAmount <= 0) {
        res.status(400).json({ error: `Tamaño no disponible para: ${producto.nombre} (${sizeName})` });
        return;
      }

      const hasAlternatives = producto.precio_mini != null || producto.precio_grande != null;
      const name = hasAlternatives ? `${producto.nombre} (${sizeName})` : producto.nombre;
      const description = [producto.descripcion, item.variant]
        .filter((value): value is string => Boolean(value && value.trim()))
        .join(' · ');

      line_items.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name,
            ...(description ? { description } : {}),
          },
          unit_amount: unitAmount,
        },
        quantity,
      });
    }

    const origin = (req.headers.origin as string) ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
      metadata: { tipo: isDelivery ? 'delivery' : 'mesa' },
    };

    // Solo los pedidos a domicilio piden dirección y teléfono. Los pagos de
    // mesa no deben obligar al cliente a rellenar datos de envío.
    if (isDelivery) {
      sessionParams.shipping_address_collection = { allowed_countries: ['ES'] };
      sessionParams.phone_number_collection = { enabled: true };
    }

    console.log('[checkout] Creando sesión de Stripe', {
      tipo: isDelivery ? 'delivery' : 'mesa',
      items: items.length,
      metadata: sessionParams.metadata,
      recogeDireccion: isDelivery,
      recogeTelefono: isDelivery,
    });

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('[checkout] Sesión creada', { sessionId: session.id, tipo: isDelivery ? 'delivery' : 'mesa' });

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    const msg = err && err.message ? err.message : String(err);
    process.stderr.write('Stripe checkout error: ' + msg + '\n');
    res.status(500).json({ error: msg || 'No se pudo preparar el pago' });
  }
}
