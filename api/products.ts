/**
 * Función serverless de Vercel: /api/products
 * Gestiona productos para la Carta y el Panel de Administración.
 *
 * Endpoints:
 *   GET    /api/products     → lista todos los productos (público, para la Carta)
 *   PATCH  /api/products/:id → actualiza agotado (requiere x-admin-password)
 *
 * La tabla `products` de Neon usa precios en euros con tipo NUMERIC(10,2).
 * La API devuelve esos valores en euros y también en céntimos para el carrito.
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

type ProductoRow = {
  id: number;
  nombre: string;
  precio: string | number;
  precio_mini: string | number | null;
  precio_grande: string | number | null;
  categoria: string;
  agotado: boolean;
  imagen_url: string | null;
  descripcion: string | null;
};

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function toCents(value: number | null): number | null {
  return value === null ? null : Math.round(value * 100);
}

function mapProducto(row: ProductoRow) {
  const precio = toNumber(row.precio) ?? 0;
  const precioMini = toNumber(row.precio_mini);
  const precioGrande = toNumber(row.precio_grande);

  return {
    id: Number(row.id),
    nombre: row.nombre,
    precio,
    precioCents: Math.round(precio * 100),
    precio_mini: precioMini,
    precioMiniCents: toCents(precioMini),
    precio_grande: precioGrande,
    precioGrandeCents: toCents(precioGrande),
    categoria: row.categoria,
    agotado: Boolean(row.agotado),
    imagen_url: row.imagen_url ?? null,
    descripcion: row.descripcion ?? null,
  };
}

function getAdminPassword(req: any): string | null {
  const header = req.headers?.['x-admin-password'];
  if (Array.isArray(header)) return header[0] ?? null;
  return typeof header === 'string' ? header : null;
}

export default async function handler(req: any, res: any) {
  const { method } = req;
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const path = url.pathname;
  const match = path.match(/^\/api\/products\/([^\/]+)$/);
  const body = req.body || {};
  // Vercel puede reescribir /api/products/:id a /api/products, así que también
  // aceptamos el id por query string o en el cuerpo de la petición.
  const rawId = match ? match[1] : (url.searchParams.get('id') ?? body.id);

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');
  res.setHeader('Cache-Control', 'no-store');

  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // ---------- GET /api/products ----------
    if (method === 'GET' && rawId == null) {
      const result = await sql`
        SELECT id, nombre, precio, precio_mini, precio_grande, categoria, agotado, imagen_url, descripcion
        FROM products
        ORDER BY categoria ASC, nombre ASC
      `;

      const productos = (result as ProductoRow[]).map(mapProducto);
      return res.status(200).json({ productos, count: productos.length });
    }

    // ---------- PATCH /api/products/:id ----------
    if (method === 'PATCH' && rawId != null) {
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminPassword) {
        return res.status(500).json({ error: 'ADMIN_PASSWORD no está configurada en el servidor' });
      }

      if (getAdminPassword(req) !== adminPassword) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const id = Number(rawId);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'ID de producto no válido' });
      }

      const { agotado } = body;

      if (typeof agotado !== 'boolean') {
        return res.status(400).json({ error: 'El campo agotado debe ser booleano' });
      }

      const result = await sql`
        UPDATE products
        SET agotado = ${agotado}
        WHERE id = ${id}
        RETURNING id, nombre, precio, precio_mini, precio_grande, categoria, agotado, imagen_url, descripcion
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      return res.status(200).json({ ok: true, producto: mapProducto(result[0] as ProductoRow) });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err: any) {
    console.error('Error en /api/products:', err);
    return res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
}
