/**
 * Función serverless de Vercel: /api/products
 * Gestiona productos para la Carta y el Panel de Administración.
 *
 * Endpoints:
 *   GET    /api/products     → lista todos los productos (público, para la Carta)
 *   POST   /api/products     → crea un nuevo producto (requiere x-admin-password)
 *   PATCH  /api/products/:id → actualiza uno o más campos del producto (requiere x-admin-password)
 *     Campos aceptados: nombre, precio, precio_mini, precio_grande, categoria, descripcion, imagen_url, agotado
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
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

      const {
        nombre,
        precio,
        precio_mini,
        precio_grande,
        categoria,
        descripcion,
        imagen_url,
        agotado,
      } = body;

      // Columnas permitidas (evita inyección por nombre de columna)
      const allowedColumns: Record<string, string> = {
        nombre: 'nombre',
        precio: 'precio',
        precio_mini: 'precio_mini',
        precio_grande: 'precio_grande',
        categoria: 'categoria',
        descripcion: 'descripcion',
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
      if (agotado !== undefined) {
        if (typeof agotado !== 'boolean') {
          return res.status(400).json({ error: 'El campo agotado debe ser booleano' });
        }
        updates.push({ key: 'agotado', value: agotado });
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
      }

      // Construir un solo UPDATE dinámico con todos los campos modificados
      const setClauses = updates.map(({ key }) => {
        const col = allowedColumns[key];
        if (!col) return null;
        const value = updates.find((u) => u.key === key)!.value;
        return sql`${sql.raw(col)} = ${value}`;
      }).filter(Boolean);

      await sql`
        UPDATE products
        SET ${sql.join(setClauses, sql`, `)}
        WHERE id = ${id}
      `;

      // Devolver producto actualizado
      const result = await sql`
        SELECT id, nombre, precio, precio_mini, precio_grande, categoria, agotado, imagen_url, descripcion
        FROM products
        WHERE id = ${id}
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      return res.status(200).json({ ok: true, producto: mapProducto(result[0] as ProductoRow) });
    }

    // ---------- POST /api/products ----------
    if (method === 'POST' && rawId == null) {
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminPassword) {
        return res.status(500).json({ error: 'ADMIN_PASSWORD no está configurada en el servidor' });
      }

      if (getAdminPassword(req) !== adminPassword) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const {
        nombre,
        precio,
        precio_mini,
        precio_grande,
        categoria,
        descripcion,
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

      const result = await sql`
        INSERT INTO products (nombre, precio, precio_mini, precio_grande, categoria, agotado, imagen_url, descripcion)
        VALUES (${nombre.trim()}, ${precioNum}, ${precioMiniFinal}, ${precioGrandeFinal}, ${categoria.trim()}, ${agotadoFinal}, ${imagenUrlFinal}, ${descripcionFinal})
        RETURNING id, nombre, precio, precio_mini, precio_grande, categoria, agotado, imagen_url, descripcion
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
