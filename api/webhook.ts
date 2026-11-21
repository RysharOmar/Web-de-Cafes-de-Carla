/**
 * Compatibilidad con la URL de webhook ya registrada en Stripe.
 *
 * Toda la lógica (validación de firma, evento checkout.session.completed y
 * guardado en Neon) vive en /api/stripe-webhook. Re-exportamos su handler y
 * su configuración para que ambas rutas funcionen igual.
 */
export { config } from './stripe-webhook';
export { default } from './stripe-webhook';
