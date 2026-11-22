import { supabase } from '@/lib/supabaseClient';

/**
 * Devuelve la cabecera Authorization con el access_token de la sesión actual.
 * Las APIs serverless validan este token y el rol del usuario.
 */
export async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** fetch con el token de Supabase añadido automáticamente. */
export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = await authHeaders();
  return fetch(input, {
    ...init,
    headers: { ...headers, ...(init.headers as Record<string, string> | undefined) },
  });
}
