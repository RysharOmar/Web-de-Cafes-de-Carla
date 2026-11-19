/**
 * Función serverless de Vercel: /api/categories
 * Devuelve las categorías existentes en la carta.
 *
 * IMPORTANTE: no existe una tabla `categories` en la base de datos.
 * Las categorías son valores de texto en la columna `products.categoria`,
 * por lo que se obtienen con SELECT DISTINCT. Cuando se crea un producto
 * con una categoría nueva, esta aparece automáticamente en la lista.
 *
 * Endpoints:
 *   GET /api/categories → { categorias: string[] }
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: any, res: any) {
  const { method } = req;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const result = await sql`
      SELECT DISTINCT categoria
      FROM products
      WHERE categoria IS NOT NULL AND categoria <> ''
      ORDER BY categoria ASC
    `;

    const categorias = (result as Array<{ categoria: string }>)
      .map((row) => row.categoria)
      .filter(Boolean);

    return res.status(200).json({ categorias });
  } catch (err: any) {
    console.error('Error en /api/categories:', err);
    return res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
