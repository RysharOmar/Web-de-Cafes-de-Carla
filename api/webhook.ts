/**
 * Compatibilidad con la URL de webhook ya registrada en Stripe.
 *
 * Toda la lógica vive en /api/stripe-webhook. La configuración se declara
 * explícitamente aquí (no re-exportada) para que Vercel desactive el
 * body parser también en esta ruta y la firma de Stripe se pueda validar.
 */
import handler from './stripe-webhook';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function webhookHandler(req: any, res: any) {
  console.log('[webhook] Petición entrante en /api/webhook', {
    method: req.method,
    url: req.url,
  });
  return handler(req, res);
}
