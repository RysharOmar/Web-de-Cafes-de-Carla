/**
 * Función serverless de Vercel: /api/products
 * Gestiona productos para la Carta y el Panel de Administración.
 *
 * Endpoints:
 *   GET    /api/products     → lista todos los productos (público, para la Carta)
 *   POST   /api/products     → crea un nuevo producto (requiere Bearer token con rol admin)
 *   PATCH  /api/products/:id → actualiza uno o más campos del producto (requiere Bearer token con rol admin)
 *     Campos aceptados: nombre, precio, precio_mini, precio_grande, categoria, descripcion, imagen_url, agotado
 *   DELETE /api/products/:id → elimina el producto (requiere Bearer token con rol admin)
 *
 * La tabla `products` de Neon usa precios en euros con tipo NUMERIC(10,2).
 * La API devuelve esos valores en euros y también en céntimos para el carrito.
 */

import { neon } from '@neondatabase/serverless';
import { Pool } from 'pg';
import { requireStaffRole } from './_auth';

const sql = neon(process.env.DATABASE_URL!);

// Pool de pg para consultas con parámetros ($1, $2, ...) en UPDATE/DELETE dinámicos.
// `neon` no expone sql.raw/sql.join, así que usamos pg para esos casos.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

type ProductoRow = {
  id: number;
  nombre: string;
  nombre_en: string | null;
  descripcion: string | null;
  descripcion_en: string | null;
  categoria: string;
  categoria_en: string | null;
  precio: string | number;
  precio_mini: string | number | null;
  precio_grande: string | number | null;
  agotado: boolean;
  imagen_url: string | null;
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
    nombre_en: row.nombre_en ?? null,
    precio,
    precioCents: Math.round(precio * 100),
    precio_mini: precioMini,
    precioMiniCents: toCents(precioMini),
    precio_grande: precioGrande,
    precioGrandeCents: toCents(precioGrande),
    categoria: row.categoria,
    categoria_en: row.categoria_en ?? null,
    agotado: Boolean(row.agotado),
    imagen_url: row.imagen_url ?? null,
    descripcion: row.descripcion ?? null,
    descripcion_en: row.descripcion_en ?? null,
  };
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');

  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // ---------- GET /api/products ----------
    if (method === 'GET' && rawId == null) {
      const result = await sql`
        SELECT id, nombre, nombre_en, descripcion, descripcion_en, categoria, categoria_en, agotado, imagen_url, precio, precio_mini, precio_grande
        FROM products
        ORDER BY categoria ASC, nombre ASC
      `;

      const productos = (result as ProductoRow[]).map(mapProducto);
      return res.status(200).json({ productos, count: productos.length });
    }

    // ---------- PATCH /api/products/:id ----------
    if (method === 'PATCH' && rawId != null) {
      const auth = await requireStaffRole(req, res, ['admin']);
      if (!auth) return;

      const id = Number(rawId);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'ID de producto no válido' });
      }

      const {
        nombre,
        nombre_en,
        precio,
        precio_mini,
        precio_grande,
        categoria,
        categoria_en,
        descripcion,
        descripcion_en,
        imagen_url,
        agotado,
      } = body;

      // Columnas permitidas (evita inyección por nombre de columna)
      const allowedColumns: Record<string, string> = {
        nombre: 'nombre',
        nombre_en: 'nombre_en',
        precio: 'precio',
        precio_mini: 'precio_mini',
        precio_grande: 'precio_grande',
        categoria: 'categoria',
        categoria_en: 'categoria_en',
        descripcion: 'descripcion',
        descripcion_en: 'descripcion_en',
        imagen_url: 'imagen_url',
        agotado: 'agotado',
      };

      type UpdateField = { key: string; value: unknown };
      const updates: UpdateField[] = [];

      // ---- nombre ----
      if (nombre !== undefined) {
        if (typeof nombre !== 'string' || nombre.trim() === '') {
          return res.status(400).json({ error: 'El campo nombre debe ser un texto no vacío' });
        }
        updates.push({ key: 'nombre', value: nombre.trim() });
      }

      // ---- nombre_en (admite null) ----
      if (nombre_en !== undefined) {
        if (nombre_en === null || nombre_en === '') {
          updates.push({ key: 'nombre_en', value: null });
        } else if (typeof nombre_en !== 'string') {
          return res.status(400).json({ error: 'nombre_en debe ser texto o null' });
        } else {
          updates.push({ key: 'nombre_en', value: nombre_en.trim() || null });
        }
      }

      // ---- precio ----
      if (precio !== undefined) {
        const p = toNumber(precio);
        if (p === null || p < 0) {
          return res.status(400).json({ error: 'El campo precio debe ser un número mayor o igual a 0' });
        }
        updates.push({ key: 'precio', value: p });
      }

      // ---- precio_mini (admite null) ----
      if (precio_mini !== undefined) {
        if (precio_mini === null || precio_mini === '') {
          updates.push({ key: 'precio_mini', value: null });
        } else {
          const pm = toNumber(precio_mini);
          if (pm === null || pm < 0) {
            return res.status(400).json({ error: 'precio_mini debe ser número >= 0 o null' });
          }
          updates.push({ key: 'precio_mini', value: pm });
        }
      }

      // ---- precio_grande (admite null) ----
      if (precio_grande !== undefined) {
        if (precio_grande === null || precio_grande === '') {
          updates.push({ key: 'precio_grande', value: null });
        } else {
          const pg = toNumber(precio_grande);
          if (pg === null || pg < 0) {
            return res.status(400).json({ error: 'precio_grande debe ser número >= 0 o null' });
          }
          updates.push({ key: 'precio_grande', value: pg });
        }
      }

      // ---- categoria ----
      if (categoria !== undefined) {
        if (typeof categoria !== 'string' || categoria.trim() === '') {
          return res.status(400).json({ error: 'El campo categoría debe ser un texto no vacío' });
        }
        updates.push({ key: 'categoria', value: categoria.trim() });
      }

      // ---- descripcion (admite null) ----
      if (descripcion !== undefined) {
        if (descripcion === null || descripcion === '') {
          updates.push({ key: 'descripcion', value: null });
        } else if (typeof descripcion !== 'string') {
          return res.status(400).json({ error: 'descripcion debe ser texto o null' });
        } else {
          updates.push({ key: 'descripcion', value: descripcion.trim() || null });
        }
      }

      // ---- descripcion_en (admite null) ----
      if (descripcion_en !== undefined) {
        if (descripcion_en === null || descripcion_en === '') {
          updates.push({ key: 'descripcion_en', value: null });
        } else if (typeof descripcion_en !== 'string') {
          return res.status(400).json({ error: 'descripcion_en debe ser texto o null' });
        } else {
          updates.push({ key: 'descripcion_en', value: descripcion_en.trim() || null });
        }
      }

      // ---- categoria_en (admite null) ----
      if (categoria_en !== undefined) {
        if (categoria_en === null || categoria_en === '') {
          updates.push({ key: 'categoria_en', value: null });
        } else if (typeof categoria_en !== 'string') {
          return res.status(400).json({ error: 'categoria_en debe ser texto o null' });
        } else {
          updates.push({ key: 'categoria_en', value: categoria_en.trim() || null });
        }
      }

      // ---- imagen_url (admite null) ----
      if (imagen_url !== undefined) {
        if (imagen_url === null || imagen_url === '') {
          updates.push({ key: 'imagen_url', value: null });
        } else if (typeof imagen_url !== 'string') {
          return res.status(400).json({ error: 'imagen_url debe ser texto o null' });
        } else {
          updates.push({ key: 'imagen_url', value: imagen_url.trim() || null });
        }
      }

      // ---- agotado ----
      // Caso especial: si solo se envía el campo agotado (toggle del panel),
      // hacemos un UPDATE directo y simple para evitar problemas de parámetros
      // de neon (sql.join is not a function, sql.raw is not a function).
      // Si vienen otros campos junto con agotado, seguimos el flujo normal.
      if (agotado !== undefined && Object.keys(body).length === 1) {
        if (typeof agotado !== 'boolean') {
          return res.status(400).json({ error: 'El campo agotado debe ser booleano' });
        }
        // UPDATE directo y simple para el campo agotado
        await sql`
          UPDATE products SET agotado = ${agotado} WHERE id = ${id}
        `;
        // Devolver producto actualizado
        const result = await sql`
          SELECT id, nombre, nombre_en, descripcion, descripcion_en, categoria, categoria_en, agotado, imagen_url, precio, precio_mini, precio_grande
          FROM products
          WHERE id = ${id}
        `;
        if (result.length === 0) {
          return res.status(404).json({ error: 'Producto no encontrado' });
        }
        return res.status(200).json({ ok: true, producto: mapProducto(result[0] as ProductoRow) });
      }

      if (agotado !== undefined) {
        updates.push({ key: 'agotado', value: agotado });
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
      }

      // Construir el UPDATE con parámetros $1, $2, ... (nombres de columna
      // validados contra la lista blanca; los valores SIEMPRE van como parámetros).
      const validUpdates = updates.filter((u) => allowedColumns[u.key]);
      const setClause = validUpdates
        .map((u, i) => `${allowedColumns[u.key]} = $${i + 1}`)
        .join(', ');
      const values: unknown[] = validUpdates.map((u) => u.value);
      values.push(id);

      const result = await pool.query(
        `UPDATE products SET ${setClause} WHERE id = $${validUpdates.length + 1}
         RETURNING id, nombre, nombre_en, descripcion, descripcion_en, categoria, categoria_en, agotado, imagen_url, precio, precio_mini, precio_grande`,
        values,
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      return res.status(200).json({ ok: true, producto: mapProducto(result.rows[0] as ProductoRow) });
    }

    // ---------- DELETE /api/products/:id ----------
    if (method === 'DELETE' && rawId != null) {
      const auth = await requireStaffRole(req, res, ['admin']);
      if (!auth) return;

      const id = Number(rawId);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'ID de producto no válido' });
      }

      const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      return res.status(200).json({ ok: true });
    }

    // ---------- POST /api/products ----------
    if (method === 'POST' && rawId == null) {
      const auth = await requireStaffRole(req, res, ['admin']);
      if (!auth) return;

      const {
        nombre,
        nombre_en,
        precio,
        precio_mini,
        precio_grande,
        categoria,
        categoria_en,
        descripcion,
        descripcion_en,
        imagen_url,
        agotado,
      } = body;

      // ---- validar nombre (requerido) ----
      if (typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({ error: 'El campo nombre es requerido y no puede estar vacío' });
      }

      // ---- validar precio (requerido) ----
      const precioNum = toNumber(precio);
      if (precioNum === null || precioNum < 0) {
        return res.status(400).json({ error: 'El campo precio es requerido y debe ser un número mayor o igual a 0' });
      }

      // ---- validar categoria (requerido) ----
      if (typeof categoria !== 'string' || categoria.trim() === '') {
        return res.status(400).json({ error: 'El campo categoría es requerido y no puede estar vacío' });
      }

      // ---- precio_mini (opcional, null o número >= 0) ----
      let precioMiniFinal: number | null = null;
      if (precio_mini !== undefined && precio_mini !== null && precio_mini !== '') {
        const pm = toNumber(precio_mini);
        if (pm === null || pm < 0) {
          return res.status(400).json({ error: 'precio_mini debe ser número >= 0 o null' });
        }
        precioMiniFinal = pm;
      }

      // ---- precio_grande (opcional, null o número >= 0) ----
      let precioGrandeFinal: number | null = null;
      if (precio_grande !== undefined && precio_grande !== null && precio_grande !== '') {
        const pg = toNumber(precio_grande);
        if (pg === null || pg < 0) {
          return res.status(400).json({ error: 'precio_grande debe ser número >= 0 o null' });
        }
        precioGrandeFinal = pg;
      }

      // ---- descripcion (opcional, null o texto) ----
      let descripcionFinal: string | null = null;
      if (descripcion !== undefined && descripcion !== null && descripcion !== '') {
        if (typeof descripcion !== 'string') {
          return res.status(400).json({ error: 'descripcion debe ser texto o null' });
        }
        descripcionFinal = descripcion.trim() || null;
      }

      // ---- imagen_url (opcional, null o texto) ----
      let imagenUrlFinal: string | null = null;
      if (imagen_url !== undefined && imagen_url !== null && imagen_url !== '') {
        if (typeof imagen_url !== 'string') {
          return res.status(400).json({ error: 'imagen_url debe ser texto o null' });
        }
        imagenUrlFinal = imagen_url.trim() || null;
      }

      // ---- agotado (opcional, booleano, default false) ----
      const agotadoFinal = typeof agotado === 'boolean' ? agotado : false;

      // ---- nombre_en (opcional) ----
      let nombreEnFinal: string | null = null;
      if (nombre_en !== undefined && nombre_en !== null && nombre_en !== '') {
        if (typeof nombre_en !== 'string') {
          return res.status(400).json({ error: 'nombre_en debe ser texto o null' });
        }
        nombreEnFinal = nombre_en.trim() || null;
      }

      // ---- descripcion_en (opcional) ----
      let descripcionEnFinal: string | null = null;
      if (descripcion_en !== undefined && descripcion_en !== null && descripcion_en !== '') {
        if (typeof descripcion_en !== 'string') {
          return res.status(400).json({ error: 'descripcion_en debe ser texto o null' });
        }
        descripcionEnFinal = descripcion_en.trim() || null;
      }

      // ---- categoria_en (opcional) ----
      let categoriaEnFinal: string | null = null;
      if (categoria_en !== undefined && categoria_en !== null && categoria_en !== '') {
        if (typeof categoria_en !== 'string') {
          return res.status(400).json({ error: 'categoria_en debe ser texto o null' });
        }
        categoriaEnFinal = categoria_en.trim() || null;
      }

      const result = await sql`
        INSERT INTO products (nombre, nombre_en, precio, precio_mini, precio_grande, categoria, categoria_en, agotado, imagen_url, descripcion, descripcion_en)
        VALUES (${nombre.trim()}, ${nombreEnFinal}, ${precioNum}, ${precioMiniFinal}, ${precioGrandeFinal}, ${categoria.trim()}, ${categoriaEnFinal}, ${agotadoFinal}, ${imagenUrlFinal}, ${descripcionFinal}, ${descripcionEnFinal})
        RETURNING id, nombre, nombre_en, descripcion, descripcion_en, categoria, categoria_en, agotado, imagen_url, precio, precio_mini, precio_grande
      `;

      if (result.length === 0) {
        return res.status(500).json({ error: 'No se pudo crear el producto' });
      }

      return res.status(201).json({ ok: true, producto: mapProducto(result[0] as ProductoRow) });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err: any) {
    console.error('Error en /api/products:', err);
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
