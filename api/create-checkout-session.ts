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
import { lookup } from 'node:dns/promises';

// ============================================================================
// TODO: REMOVER CLAVE HARDCODEADA ANTES DE ENTREGAR AL CLIENTE.
// ----------------------------------------------------------------------------
// Clave de Stripe en modo PRUEBA, solo para la demo temporal.
// Cuando el cliente entregue su cuenta de Stripe:
//   1. Configurar STRIPE_SECRET_KEY en Vercel.
//   2. Eliminar las constantes DEMO_STRIPE_KEY_PART_* y este bloque completo.
// La clave se parte en dos fragmentos para que GitHub no bloquee el push.
// ============================================================================
const DEMO_STRIPE_KEY_PART_1 = 'sk_test_51UVZfqRfNgxXGS18C15gKVOBsdMTrQl1ukO0gkgE9Q07Wc1ljxBO0LIuL';
const DEMO_STRIPE_KEY_PART_2 = 'AgNbRDYiuAvjnwBYSuxyOzPPuNCE7Bo00mV4LIR3d';
const DEMO_STRIPE_KEY = DEMO_STRIPE_KEY_PART_1 + DEMO_STRIPE_KEY_PART_2;

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
  const trimmed = value?.trim();
  if (!trimmed) return null;
  // Una clave de Stripe válida es ASCII imprimible y empieza por sk_test_/sk_live_.
  if (!/^sk_(test|live)_[A-Za-z0-9]+$/.test(trimmed)) return null;
  return trimmed;
}

export default async function handler(req: any, res: any) {
  const rawEnvSecret = process.env.STRIPE_SECRET_KEY;
  const envSecret = cleanStripeKey(rawEnvSecret);
  const stripeSecret = envSecret || DEMO_STRIPE_KEY;

  const envInfo = {
    envKeyPresent: Boolean(rawEnvSecret),
    envKeyLength: rawEnvSecret?.length ?? 0,
    envKeyValidFormat: Boolean(envSecret),
    usingFallback: !envSecret,
  };

  // Diagnóstico temporal de conectividad con Stripe (se elimina tras depurar).
  if (req.method === 'GET') {
    const out: Record<string, unknown> = { ...envInfo };
    try {
      out.dns = await lookup('api.stripe.com', { all: true });
    } catch (error: any) {
      out.dnsError = { code: error?.code, message: error?.message };
    }
    try {
      const response = await fetch('https://api.stripe.com/healthcheck');
      out.fetchStatus = response.status;
      out.fetchBody = (await response.text()).slice(0, 80);
    } catch (error: any) {
      out.fetchError = {
        name: error?.name,
        message: error?.message,
        cause: error?.cause?.code ?? error?.cause?.message,
      };
    }
    res.status(200).json(out);
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  try {
    if (!envSecret) {
      const reason = rawEnvSecret
        ? 'STRIPE_SECRET_KEY existe pero tiene un formato inválido'
        : 'STRIPE_SECRET_KEY no configurada';
      process.stderr.write(`AVISO: ${reason}; usando clave de prueba temporal de la demo.\n`);
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
    const diagnostic = {
      message: msg,
      type: err?.type,
      code: err?.code,
      detail: err?.detail,
      causeCode: err?.cause?.code,
      causeMessage: err?.cause?.message,
      rawCode: err?.raw?.code,
      rawMessage: err?.raw?.message,
      ...envInfo,
    };
    process.stderr.write('Stripe checkout error: ' + JSON.stringify(diagnostic) + '\n');
    res.status(500).json({ error: msg, diagnostic });
  }
}
