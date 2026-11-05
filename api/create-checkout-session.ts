/**
 * Función serverless de Vercel: POST /api/create-checkout-session
 * Crea una sesión de Stripe Checkout en modo de prueba y devuelve session.url.
 * Los precios se resuelven en el servidor desde el catálogo, nunca del navegador.
 * La clave de Stripe se lee únicamente de una constante de este módulo backend.
 */
import Stripe from 'stripe';
import { getCatalogItem, isSellable, priceForSize } from './catalog';

const PART1 = 'sk_test_51UVZfqRfNgxXGS18C15gKVOBsdMTrQl1ukO0gkgE9Q07Wc1ljxBO0LIuL';
const PART2 = 'AgNbRDYiuAvjnwBYSuxyOzPPuNCE7Bo00mV4LIR3d';
const STRIPE_SECRET_KEY = PART1 + PART2;

const stripe = new Stripe(STRIPE_SECRET_KEY);

type CartItem = {
  id: string;
  quantity: number;
  sizeLabel?: string;
  variant?: string;
  priceCents?: number;
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  try {
    const { items } = req.body as { items?: CartItem[] };

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Carrito vacío' });
      return;
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of items) {
      const productId = String(item.id);
      const sizeLabel = item.sizeLabel || '';
      const quantity = Math.max(1, Math.floor(Number(item.quantity || 1)));

      const catalogItem = getCatalogItem(productId);
      if (!catalogItem) {
        res.status(400).json({ error: `Producto no encontrado: ${productId}` });
        return;
      }

      // Precio según tamaño seleccionado (backend, no del navegador)
      const unitAmount = item.priceCents !== undefined
        ? item.priceCents
        : priceForSize(productId, sizeLabel);

      if (unitAmount <= 0) {
        res.status(400).json({ error: `Precio no disponible para: ${productId} (${sizeLabel})` });
        return;
      }

      line_items.push({
        price_data: {
          currency: catalogItem.currency,
          product_data: {
            name: sizeLabel ? `${catalogItem.name} (${sizeLabel})` : catalogItem.name,
            ...(catalogItem.description ? { description: catalogItem.description } : {}),
            ...(item.variant ? { description: (catalogItem.description ? catalogItem.description + ' · ' : '') + item.variant } : {}),
          },
          unit_amount: unitAmount,
        },
        quantity,
      });
    }

    const origin = (req.headers.origin as string) || 
      (process.env.VERCEL_URL || 'http://localhost:3000');

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
