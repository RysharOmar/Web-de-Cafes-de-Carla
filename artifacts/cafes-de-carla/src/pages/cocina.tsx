import { useEffect, useState } from 'react';
import { Check, Clock, X, ArrowLeft } from 'lucide-react';

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

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

const STORAGE_KEY = 'cafes_de_carla_orders';

function loadOrdersFromStorage(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveOrdersToStorage(orders: Order[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export default function Cocina() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'served'>('all');
  const [loading, setLoading] = useState(true);

  // Cargar pedidos desde localStorage
  useEffect(() => {
    refreshOrders();
    const interval = setInterval(refreshOrders, 3000);
    return () => clearInterval(interval);
  }, [filterStatus]);

  function refreshOrders() {
    setLoading(true);
    const all = loadOrdersFromStorage();
    let filtered = all.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    if (filterStatus !== 'all') {
      filtered = filtered.filter((o) => o.status === filterStatus);
    }
    setOrders(filtered);
    setLoading(false);
  }

  async function updateOrderStatus(orderId: string, newStatus: Order['status']) {
    const all = loadOrdersFromStorage();
    const updated = all.map((o) => {
      if (o.id === orderId) {
        const now = new Date().toISOString();
        return {
          ...o,
          status: newStatus,
          ...(newStatus === 'confirmed' ? { confirmedAt: now } : {}),
          ...(newStatus === 'served' ? { servedAt: now } : {}),
          ...(newStatus === 'paid' ? { paidAt: now } : {}),
        };
      }
      return o;
    });
    saveOrdersToStorage(updated);
    refreshOrders();
  }

  const statusColor: Record<string, string> = {
    pending: '#b9aa95',
    confirmed: '#6b7d4c',
    served: '#4a3322',
    paid: '#81945b',
  };

  const statusLabel: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    served: 'Servido',
    paid: 'Pagado',
  };

  return (
    <div className="site-shell grain min-h-[100dvh]">
      <header className="site-header">
        <div className="header-inner section-wrap">
          <button
            className="text-cta focus-ring"
            onClick={() => (window.location.href = '/')}
            data-testid="button-back-home"
          >
            <ArrowLeft size={15} aria-hidden="true" /> Volver a la carta
          </button>
          <div style={{ flex: 1 }} />
          <span className="serif" style={{ fontSize: '20px', color: '#4a3322' }}>
            🍽️ Cocina — Pedidos de Mesa
          </span>
          <div style={{ flex: 1 }} />
        </div>
      </header>

      <main className="section-wrap" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <h2 className="serif" style={{ fontSize: '28px', margin: 0 }}>
            Pedidos de Mesa
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'pending', 'confirmed', 'served'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '99px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  background: filterStatus === status ? '#6b7d4c' : '#fff',
                  border: filterStatus === status ? 'none' : '1px solid #b9aa95',
                  color: filterStatus === status ? '#fff' : '#604b36',
                  fontWeight: 600,
                }}
              >
                {statusLabel[status]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Clock size={32} style={{ animation: 'spin 2s linear infinite', display: 'block', margin: '0 auto 16px' }} />
            <p style={{ color: '#7c6f5e', fontSize: '16px', margin: 0 }}>Cargando pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7c6f5e' }}>
            <Clock size={48} style={{ marginBottom: '16px', opacity: '.5' }} />
            <p style={{ fontSize: '18px', margin: 0 }}>
              {filterStatus === 'all' ? 'No hay pedidos pendientes' : `No hay pedidos ${statusLabel[filterStatus]}`}</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              Los pedidos de las mesas aparecerán aquí cuando el cliente haga clic en "Enviar a cocina".
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  border: '1px solid #ddd1bd',
                  borderRadius: '12px',
                  padding: '20px',
                  background: order.status === 'pending' ? '#fffbeb' : '#fff',
                  boxShadow: '0 4px 12px rgba(74, 51, 34, 0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e8ead9', color: '#6b7d4c', padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 700 }}>
                      Mesa {order.table}
                    </span>
                    <span style={{ marginLeft: '12px', fontSize: '12px', color: '#9a8b75' }}>
                      {new Date(order.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#fff',
                      background: statusColor[order.status],
                      textTransform: 'uppercase',
                      letterSpacing: '.05em',
                    }}
                  >
                    {statusLabel[order.status]}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '12px', marginBottom: '16px' }}>
                  {order.items.map((item) => (
                    <div key={item.id + '-' + item.quantity} style={{ padding: '8px', background: '#fbf8f0', borderRadius: '8px' }}>
                      <div style={{ fontWeight: 700, color: '#4a3322', fontSize: '14px', marginBottom: '2px' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#7c6f5e' }}>
                        {item.quantity} × {formatPrice(item.priceCents)}
                        {item.sizeLabel ? ` · ${item.sizeLabel}` : ''}
                        {item.variant ? ` · ${item.variant}` : ''}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#4a3322', fontFamily: 'var(--app-font-serif)' }}>
                    Total: {formatPrice(order.totalCents)}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        style={{
                          background: '#6b7d4c',
                          color: '#fff',
                          border: 'none',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <Check size={16} /> Confirmar
                      </button>
                    )}
                    {order.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'served')}
                          style={{
                            background: '#4a3322',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Servido
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'pending')}
                          style={{
                            background: 'transparent',
                            color: '#b9aa95',
                            border: '1px solid #b9aa95',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <X size={16} /> Reiniciar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="site-footer">
        <div className="footer-main section-wrap">
          <span className="footer-tagline serif">Cafés de Carla — Cocina</span>
          <span style={{ fontSize: '10px', color: '#9a8b75' }}>Panel solo para personal del local · Datos en memoria local</span>
        </div>
      </footer>
    </div>
  );
}
