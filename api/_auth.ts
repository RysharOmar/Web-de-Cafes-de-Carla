/**
 * Helper serverless: valida el access_token de Supabase enviado como
 * Authorization: Bearer <token> y comprueba el rol en app_metadata.
 */
import { createClient } from '@supabase/supabase-js';

export type StaffRole = 'admin' | 'cocina';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getBearerToken(req: any): string | null {
  const header = req.headers?.authorization;
  if (Array.isArray(header)) return header[0]?.startsWith('Bearer ') ? header[0].slice(7) : null;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
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
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    res.status(500).json({ error: 'Supabase no está configurado en el servidor' });
    return null;
  }

  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Falta el token de autorización' });
    return null;
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: 'Sesión no válida o caducada' });
    return null;
  }

  const rawRole = data.user.app_metadata?.role;
  const role: StaffRole | null = rawRole === 'admin' || rawRole === 'cocina' ? rawRole : null;

  if (!role || !allowedRoles.includes(role)) {
    res.status(403).json({ error: 'No tienes permisos para esta acción' });
    return null;
  }

  return {
    userId: data.user.id,
    email: data.user.email ?? null,
    role,
  };
}
