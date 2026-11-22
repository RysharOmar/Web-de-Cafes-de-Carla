import { createClient } from '@supabase/supabase-js';

/**
 * Cliente público de Supabase (solo clave pública / anon key).
 * Nunca incluir aquí la SERVICE_ROLE_KEY: esa solo se usa en las funciones
 * serverless de Vercel.
 */
const configuredUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const configuredAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!configuredUrl || !configuredAnonKey) {
  console.warn('[supabase] VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no configuradas; la autenticación no funcionará.');
}

// Valores de reserva válidos para que la app cargue en entornos sin configurar.
export const supabase = createClient(
  configuredUrl || 'https://placeholder.supabase.co',
  configuredAnonKey || 'placeholder-anon-key',
);
