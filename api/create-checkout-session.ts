/**
 * Función serverless de Vercel: POST /api/create-checkout-session
 * Crea una sesión de Stripe Checkout en modo de prueba y devuelve session.url.
 * Los precios se resuelven en el servidor desde el catálogo, nunca del navegador.
 * La clave de Stripe se lee únicamente de una constante de este módulo backend.
 */
import Stripe from 'stripe';
import { getCatalogItem, isSellable } from './catalog';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
});

type CartItem = {
  id: string;
  quantity: number;
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
      const quantity = Math.max(1, Math.floor(Number(item.quantity || 1)));

      const catalogItem = getCatalogItem(productId);
      if (!catalogItem || catalogItem.priceCents <= 0) {
        res.status(400).json({ error: `Precio no disponible para: ${productId}` });
        return;
      }

      if (!isSellable(productId)) {
        res.status(400).json({ error: `Producto sin precio asignado: ${productId}` });
        return;
      }

      line_items.push({
        price_data: {
          currency: catalogItem.currency,
          product_data: {
            name: catalogItem.name,
            ...(catalogItem.description ? { description: catalogItem.description } : {}),
          },
          unit_amount: catalogItem.priceCents,
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
