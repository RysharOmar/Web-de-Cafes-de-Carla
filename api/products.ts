/**
 * Función serverless de Vercel: /api/products
 * Gestiona productos para el Panel de Administración.
 *
 * Endpoints:
 *   GET    /api/products     → lista todos los productos (para admin)
 *   PATCH  /api/products/:id → actualiza estado agotado (para admin)
 *
 * Conecta con Neon usando @neondatabase/serverless (compatible con Vercel serverless).
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: any, res: any) {
  const { method } = req;
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const path = url.pathname;
  const match = path.match(/^\/api\/products\/([^\/]+)$/);
  const productId = match ? match[1] : null;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // ---------- GET /api/products ----------
    if (method === 'GET' && !productId) {
      const result = await sql`
        SELECT id, id_de_serie, nombre, precio, categoria, agotado, creado_en, actualizado_en
        FROM productos
        ORDER BY id
      `;
      return res.status(200).json({ productos: result, count: result.length });
    }

    // ---------- PATCH /api/products/:id ----------
    if (method === 'PATCH' && productId) {
      const { agotado } = req.body;

      if (agotado === undefined) {
        return res.status(400).json({ error: 'Falta el campo agotado' });
      }

      const result = await sql`
        UPDATE productos
        SET agotado = ${agotado}, actualizado_en = NOW()
        WHERE id = ${productId}
        RETURNING id, id_de_serie, nombre, precio, categoria, agotado, creado_en, actualizado_en
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      return res.status(200).json({ ok: true, producto: result[0] });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err: any) {
    console.error('Error en /api/products:', err);
    return res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
}
