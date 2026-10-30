/**
 * Función serverless de Vercel: POST /api/webhook
 * Webhook de Stripe. Valida la firma con STRIPE_WEBHOOK_SECRET sobre el
 * cuerpo HTTP sin procesar, procesa checkout.session.completed.
 *
 * URL pública para registrar en Stripe Dashboard (modo prueba):
 *   https://<tu-proyecto>.vercel.app/api/webhook
 * Evento a escuchar: checkout.session.completed
 *
 * Las claves se leen únicamente de constantes de este módulo backend.
 * No se exponen al frontend, no se registran en logs y no se envían en respuestas HTTP.
 */
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
  throw new Error('Stripe secret keys are not set');
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
});

// Deshabilita el parseo automático de body de Vercel para recibir el cuerpo raw
// necesario para verificar la firma de Stripe.
export const config = {
  api: {
    bodyParser: false,
  },
};

// Idempotencia simple: rastrea IDs de evento ya procesados.
// Nota: es en memoria por instancia de función.
const processedIds = new Set<string>();

function isProcessed(eventId: string): boolean {
  return processedIds.has(eventId);
}

function markProcessed(eventId: string): void {
  processedIds.add(eventId);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).send('Método no permitido');
    return;
  }

  const sig = req.headers['stripe-signature'] as string | undefined;

  if (!sig) {
    res.status(400).send('Falta firma de webhook');
    return;
  }

  // Leer cuerpo HTTP sin procesar (raw body) para verificar la firma.
  let rawBody: string;
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    rawBody = Buffer.concat(chunks).toString('utf8');
  } catch (err: any) {
    process.stderr.write('Error leyendo cuerpo del webhook\n');
    res.status(400).send('Error leyendo el cuerpo');
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    process.stderr.write('Firma de webhook inválida\n');
    res.status(400).send('Webhook Error: firma inválida');
    return;
  }

  // Idempotencia: si ya procesamos este evento, respondemos 200 sin duplicar.
  if (isProcessed(event.id)) {
    res.status(200).json({ received: true, duplicate: true });
    return;
  }
  markProcessed(event.id);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Datos no sensibles del pago completado (sin secretos ni claves).
    const payload = {
      eventId: event.id,
      type: event.type,
      sessionId: session.id,
      customerEmail: session.customer_details?.email ?? null,
      amountTotal: session.amount_total ?? null,
      currency: session.currency ?? null,
      paymentStatus: session.payment_status ?? null,
      created: session.created ?? null,
    };

    // Notificación externa (n8n u otro) si se configura en el servidor.
    // No se envían claves de Stripe.
  }

  res.status(200).json({ received: true });
}
