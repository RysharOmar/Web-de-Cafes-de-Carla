/**
 * Función serverless de Vercel: /api/admin-auth
 * Comprueba la contraseña del Panel de Administración contra ADMIN_PASSWORD.
 */

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD no está configurada en el servidor' });
  }

  const { password } = req.body || {};

  if (typeof password !== 'string' || password !== expected) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }

  return res.status(200).json({ ok: true });
}
