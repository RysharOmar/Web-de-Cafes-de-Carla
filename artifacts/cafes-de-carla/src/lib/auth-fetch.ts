import { supabase } from '@/lib/supabaseClient';

function buildInit(init: RequestInit, token: string | null): RequestInit {
  return {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers as Record<string, string> | undefined),
    },
  };
}

/**
 * fetch con el access_token de Supabase. Si el token caducó (401), lo refresca
 * y repite la petición una vez antes de fallar.
 */
export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const { data: current } = await supabase.auth.getSession();
  let response = await fetch(input, buildInit(init, current.session?.access_token ?? null));

  if (response.status !== 401) return response;

  const { data: refreshed } = await supabase.auth.refreshSession();
  if (!refreshed.session) return response;

  response = await fetch(input, buildInit(init, refreshed.session.access_token));
  return response;
}
