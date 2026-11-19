/**
 * Función serverless de Vercel: /api/upload
 * Sube una imagen a Vercel Blob y devuelve la URL pública.
 *
 * Endpoint:
 *   POST /api/upload → sube archivo (requiere x-admin-password)
 *
 * NOTA: Vercel no parsea multipart/form-data automáticamente en serverless
 * functions, así que desactivamos el bodyParser y usamos busboy para extraer
 * el archivo del cuerpo crudo.
 */

import { put } from '@vercel/blob';
import Busboy from 'busboy';
import { PassThrough } from 'stream';

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
    // Parsear multipart/form-data con busboy (Vercel no lo hace automáticamente)
    const busboyInstance = Busboy({ headers: req.headers as Record<string, string> });

    let fileBuffer: Buffer | null = null;
    let filename = 'imagen';
    let contentType = 'image/jpeg';

    busboyInstance.on('file', (fieldname, stream, fname, encoding, mime) => {
      filename = fname || 'imagen';
      contentType = mime || 'image/jpeg';
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    // Conectar el cuerpo crudo de la request a busboy
    const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(req.body || '', 'latin1');
    const readable = new PassThrough();
    readable.end(rawBody);
    readable.pipe(busboyInstance);

    // Esperar a que busboy termine de procesar el multipart
    await new Promise<void>((resolve, reject) => {
      busboyInstance.on('finish', resolve);
      busboyInstance.on('error', reject);
    });

    if (!fileBuffer) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    // Subir a Vercel Blob
    const blob = await put(filename, fileBuffer, {
      access: 'public',
      contentType,
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

export const config = {
  api: {
    bodyParser: false, // Crítico: desactivar para que Vercel no intente parsear multipart
  },
};
