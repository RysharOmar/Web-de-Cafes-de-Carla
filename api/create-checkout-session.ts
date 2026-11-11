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

type ProductoRow = {
  id: number;
  nombre: string;
  precio: string | number;
  precio_mini: string | number | null;
  precio_grande: string | number | null;
  agotado: boolean;
  descripcion: string | null;
};

type SizeLabel = 'Mini' | 'Normal' | 'Grande';

function normalizeSize(value: unknown): SizeLabel {
  if (value === 'Mini' || value === 'Grande') return value;
  return 'Normal';
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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecret) {
      res.status(500).json({ error: 'STRIPE_SECRET_KEY no está configurada en el servidor' });
      return;
    }

    const stripe = new Stripe(stripeSecret);
    const { items } = req.body as { items?: CartItem[] };

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
        SELECT id, nombre, precio, precio_mini, precio_grande, agotado, descripcion
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

      if (unitAmount === null || unitAmount <= 0) {
        res.status(400).json({ error: `Tamaño no disponible para: ${producto.nombre} (${size})` });
        return;
      }

      const hasAlternatives = producto.precio_mini != null || producto.precio_grande != null;
      const name = hasAlternatives ? `${producto.nombre} (${size})` : producto.nombre;
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
    });

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    const msg = err && err.message ? err.message : String(err);
    process.stderr.write('Stripe checkout error: ' + msg + '\n');
    res.status(500).json({ error: msg || 'No se pudo preparar el pago' });
  }
}
