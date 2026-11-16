/**
 * Función serverless de Vercel: /api/upload
 * Sube una imagen a Vercel Blob y devuelve la URL pública.
 *
 * Endpoint:
 *   POST /api/upload → sube archivo (requiere x-admin-password)
 */

import { put } from '@vercel/blob';

function getAdminPassword(req: any): string | null {
  const header = req.headers?.['x-admin-password'];
  if (Array.isArray(header)) return header[0] ?? null;
  return typeof header === 'string' ? header : null;
}

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Autenticación
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD no está configurada en el servidor' });
  }

  if (getAdminPassword(req) !== adminPassword) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    // Vercel serverless functions no parsean multipart/formData automáticamente.
    // El cuerpo ya viene como un Buffer o stream según el runtime.
    // Usamos req.body tal como llega (Vercel lo expone como objeto con los campos del form).
    const file = req.body?.file;
    const filename = req.body?.filename || 'imagen';

    if (!file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    // Subir a Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type || 'image/jpeg',
    });

    return res.status(200).json({
      ok: true,
      url: blob.url,
      filename: blob.pathname,
    });
  } catch (err: any) {
    console.error('Error en /api/upload:', err);
    return res.status(500).json({ error: err.message || 'Error subiendo la imagen' });
  }
}
