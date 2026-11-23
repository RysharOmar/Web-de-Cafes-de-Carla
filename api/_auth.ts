/**
 * Helper serverless: valida el access_token de Supabase enviado como
 * Authorization: Bearer <token> y comprueba el rol en app_metadata.
 */
import { createClient } from '@supabase/supabase-js';

export type StaffRole = 'admin' | 'cocina';

/** Acepta tanto la URL base como una URL copiada con /rest/v1 al final. */
function normalizeSupabaseUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return '';
  try {
    return new URL(value).origin;
  } catch {
    return value.replace(/\/+$/, '');
  }
}

const SUPABASE_URL = normalizeSupabaseUrl(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
);
const SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const ANON_KEY = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();

if (SUPABASE_URL) console.log('[auth] URL base de Supabase:', SUPABASE_URL);
console.log('[auth] Claves disponibles', {
  serviceRole: SERVICE_ROLE_KEY.slice(0, 8) || null,
  anon: ANON_KEY.slice(0, 8) || null,
});

function getBearerToken(req: any): string | null {
  const header = req.headers?.authorization;
  if (Array.isArray(header)) return header[0]?.startsWith('Bearer ') ? header[0].slice(7) : null;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
}

/**
 * Valida el JWT con la service role y, si esa clave no es válida, con la
 * anon key (que es la que ya usa el navegador para hacer login).
 */
async function getUserFromToken(token: string) {
  const keys = [SERVICE_ROLE_KEY, ANON_KEY].filter(Boolean) as string[];

  for (const key of [...new Set(keys)]) {
    const supabase = createClient(SUPABASE_URL, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data.user) return data.user;

    console.error('[auth] getUser rechazó el token con una clave', {
      keyPrefix: key.slice(0, 8),
      message: error?.message ?? 'sin usuario',
    });
  }

  return null;
}

/**
 * Devuelve el usuario y su rol cuando la petición está autorizada.
 * Cuando no, escribe la respuesta HTTP y devuelve null.
 */
export async function requireStaffRole(
  req: any,
  res: any,
  allowedRoles: StaffRole[],
): Promise<{ userId: string; email: string | null; role: StaffRole } | null> {
  if (!SUPABASE_URL || (!SERVICE_ROLE_KEY && !ANON_KEY)) {
    res.status(500).json({ error: 'Supabase no está configurado en el servidor' });
    return null;
  }

  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Falta el token de autorización' });
    return null;
  }

  const user = await getUserFromToken(token);
  if (!user) {
    res.status(401).json({ error: 'Sesión no válida o caducada' });
    return null;
  }

  const rawRole = user.app_metadata?.role;
  const role: StaffRole | null = rawRole === 'admin' || rawRole === 'cocina' ? rawRole : null;

  if (!role || !allowedRoles.includes(role)) {
    res.status(403).json({ error: 'No tienes permisos para esta acción' });
    return null;
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    role,
  };
}
