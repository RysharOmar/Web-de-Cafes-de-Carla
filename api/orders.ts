/**
 * Función serverless de Vercel: /api/orders
 *
 * Pedidos de mesa (modo "En el local") se guardan en memoria solo para demo:
 *   GET    /api/orders?status=pending
 *   POST   /api/orders
 *   PATCH  /api/orders/:id
 *
 * Pedidos a domicilio (creados por Stripe) se leen de la tabla `orders` de Neon:
 *   GET    /api/orders?tipo=delivery
 *   PATCH  /api/orders/:id  { estado: 'preparando' | 'entregado' }
 */
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

const DELIVERY_STATES = ['pendiente', 'preparando', 'entregado'] as const;
type DeliveryState = (typeof DELIVERY_STATES)[number];

function isDeliveryState(value: unknown): value is DeliveryState {
  return typeof value === 'string' && (DELIVERY_STATES as readonly string[]).includes(value);
}

function toNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function parseItems(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapDeliveryRow(row: any) {
  const total = toNumber(row.total);
  return {
    id: Number(row.id),
    tipo: row.tipo,
    clienteNombre: row.cliente_nombre ?? null,
    clienteEmail: row.cliente_email ?? null,
    clienteTelefono: row.cliente_telefono ?? null,
    direccionEnvio: row.direccion_envio ?? null,
    total,
    totalCents: Math.round(total * 100),
    items: parseItems(row.items),
    estado: row.estado,
    creadoEn: row.creado_en,
  };
}


type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  sizeLabel: string;
  variant?: string | null;
  priceCents: number;
};

type Order = {
  id: string;
  table: string;
  items: OrderItem[];
  totalCents: number;
  status: 'pending' | 'confirmed' | 'served' | 'paid';
  createdAt: string;
  confirmedAt?: string;
  servedAt?: string;
  paidAt?: string;
};

// Store en memoria (se reinicia en cada redeploy - solo para demo)
const orders: Map<string, Order> = new Map();

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default async function handler(req: any, res: any) {
  const { method } = req;
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const path = url.pathname;
  const match = path.match(/^\/api\/orders\/([^\/]+)$/);
  const orderId = match ? match[1] : null;

  // CORS para permitir llamadas desde el frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // ---------- GET /api/orders?tipo=delivery (Neon) ----------
  if (method === 'GET' && !orderId && url.searchParams.get('tipo') === 'delivery') {
    try {
      const estadoParam = url.searchParams.get('estado');
      const rows = estadoParam && isDeliveryState(estadoParam)
        ? await sql`
            SELECT id, tipo, cliente_nombre, cliente_email, cliente_telefono,
                   direccion_envio, total, items, estado, creado_en
            FROM orders
            WHERE tipo = 'delivery' AND estado = ${estadoParam}
            ORDER BY creado_en ASC
          `
        : await sql`
            SELECT id, tipo, cliente_nombre, cliente_email, cliente_telefono,
                   direccion_envio, total, items, estado, creado_en
            FROM orders
            WHERE tipo = 'delivery' AND estado IN ('pendiente', 'preparando')
            ORDER BY creado_en ASC
          `;

      const list = (rows as any[]).map(mapDeliveryRow);
      return res.status(200).json({ orders: list, count: list.length });
    } catch (err: any) {
      process.stderr.write(`Error leyendo pedidos delivery: ${err?.message ?? err}\n`);
      return res.status(500).json({ error: 'No se pudieron leer los pedidos a domicilio' });
    }
  }

  // ---------- GET /api/orders ----------
  if (method === 'GET' && !orderId) {
    const statusFilter = url.searchParams.get('status');
    const tableFilter = url.searchParams.get('mesa');
    let list = Array.from(orders.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    if (tableFilter) {
      list = list.filter((o) => o.table === tableFilter);
    }
    if (statusFilter && statusFilter !== 'all') {
      list = list.filter((o) => o.status === statusFilter);
    }
    return res.status(200).json({ orders: list, count: list.length });
  }

  // ---------- POST /api/orders ----------
  if (method === 'POST' && !orderId) {
    try {
      const { table, items, totalCents } = req.body;

      if (!table || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Faltan datos: tabla, ítems' });
      }

      const id = generateId();
      const newOrder: Order = {
        id,
        table: String(table),
        items: items.map((it: any) => ({
          id: it.id,
          name: it.name,
          quantity: it.quantity,
          sizeLabel: it.sizeLabel,
          variant: it.variant ?? null,
          priceCents: it.priceCents,
        })),
        totalCents: Number(totalCents) || 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      orders.set(id, newOrder);
      return res.status(201).json({ ok: true, orderId: id, order: newOrder });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error creando pedido' });
    }
  }

  // ---------- PATCH pedido a domicilio (Neon) ----------
  const body = req.body ?? {};
  const wantsDelivery =
    url.searchParams.get('tipo') === 'delivery' ||
    body.tipo === 'delivery' ||
    (orderId !== null && /^\d+$/.test(orderId));

  if (method === 'PATCH' && wantsDelivery) {
    const deliveryId = Number(orderId ?? body.id);
    const estado = body.estado ?? body.status;

    if (!Number.isInteger(deliveryId) || deliveryId <= 0) {
      return res.status(400).json({ error: 'ID de pedido no válido' });
    }
    if (!isDeliveryState(estado)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }

    try {
      const rows = await sql`
        UPDATE orders
        SET estado = ${estado}
        WHERE id = ${deliveryId} AND tipo = 'delivery'
        RETURNING id, tipo, cliente_nombre, cliente_email, cliente_telefono,
                  direccion_envio, total, items, estado, creado_en
      `;

      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(404).json({ error: 'Pedido a domicilio no encontrado' });
      }

      return res.status(200).json({ ok: true, order: mapDeliveryRow(rows[0]) });
    } catch (err: any) {
      process.stderr.write(`Error actualizando pedido delivery: ${err?.message ?? err}\n`);
      return res.status(500).json({ error: 'No se pudo actualizar el pedido' });
    }
  }

  // ---------- PATCH /api/orders/:id ----------
  if (method === 'PATCH' && orderId) {
    try {
      const { status } = req.body;
      const order = orders.get(orderId);

      if (!order) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }

      const validStatuses: Order['status'][] = ['pending', 'confirmed', 'served', 'paid'];
      if (!validStatuses.includes(status as Order['status'])) {
        return res.status(400).json({ error: 'Estado inválido' });
      }

      order.status = status as Order['status'];
      const now = new Date().toISOString();
      if (status === 'confirmed') order.confirmedAt = now;
      if (status === 'served') order.servedAt = now;
      if (status === 'paid') order.paidAt = now;

      orders.set(orderId, order);
      return res.status(200).json({ ok: true, order });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error actualizando pedido' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
