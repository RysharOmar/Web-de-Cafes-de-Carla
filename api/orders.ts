/**
 * Función serverless de Vercel: /api/orders
 * Gestiona pedidos de mesas para el modo "En el local".
 *
 * Endpoints:
 *   GET    /api/orders?status=pending   → lista pedidos (para cocina)
 *   POST   /api/orders                  → crea un pedido (desde mesa)
 *   PATCH  /api/orders/:id              → actualiza estado (cocina)
 *
 * Almacenamiento en memoria (solo para demo).
 * En producción reemplazar por base de datos real (Supabase, PostgreSQL, etc.).
 */

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

  // ---------- GET /api/orders ----------
  if (method === 'GET' && !orderId) {
    const statusFilter = url.searchParams.get('status');
    let list = Array.from(orders.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
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
