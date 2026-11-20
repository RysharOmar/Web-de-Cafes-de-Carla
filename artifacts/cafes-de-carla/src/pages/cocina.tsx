import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Banknote, Check, Clock, RotateCcw, Volume2, VolumeX } from 'lucide-react';

type OrderStatus = 'pending' | 'confirmed' | 'served' | 'paid';

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
  status: OrderStatus;
  createdAt: string;
  confirmedAt?: string;
  servedAt?: string;
  paidAt?: string;
  pagoPendienteEfectivo?: boolean;
  pagoPendienteEfectivoAt?: string;
  cobradoAt?: string;
  metodoPago?: 'efectivo' | 'tarjeta' | string;
};

type TableGroup = {
  table: string;
  orders: Order[];
  totalCents: number;
  cashPending: boolean;
  pendingCount: number;
  confirmedCount: number;
  servedCount: number;
  lastOrderAt: string;
};

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function orderTotal(order: Order) {
  if (Array.isArray(order.items) && order.items.length > 0) {
    return order.items.reduce(
      (sum, item) => sum + (Number(item.priceCents) || 0) * (Number(item.quantity) || 0),
      0
    );
  }
  return Number(order.totalCents) || 0;
}

const STORAGE_KEY = 'cafes_de_carla_orders';
const CASH_ALARM_INTERVAL_MS = 5 * 60 * 1000;

function loadOrdersFromStorage(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveOrdersToStorage(orders: Order[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

const statusLabel: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  served: 'Servido',
  paid: 'Pagado',
};

export default function Cocina() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const soundEnabledRef = useRef(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<OscillatorNode[]>([]);
  const alarmTimeoutRef = useRef<number | null>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);

  const getAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (audioCtxRef.current) return audioCtxRef.current;

    const AudioContextClass =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return null;

    try {
      audioCtxRef.current = new AudioContextClass();
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }, []);

  const stopAlarmSound = useCallback(() => {
    activeOscillatorsRef.current.forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch {
        // El oscilador ya podía estar detenido.
      }
    });
    activeOscillatorsRef.current = [];

    if (alarmTimeoutRef.current !== null) {
      window.clearTimeout(alarmTimeoutRef.current);
      alarmTimeoutRef.current = null;
    }
    setAlarmActive(false);
  }, []);

  const unlockAudio = useCallback(async () => {
    const ctx = getAudioContext();
    if (!ctx) return false;

    try {
      if (ctx.state === 'suspended') await ctx.resume();
      const running = ctx.state === 'running';
      setAudioUnlocked(running);
      return running;
    } catch {
      return false;
    }
  }, [getAudioContext]);

  const playCashAlarm = useCallback((force = false) => {
    if (!soundEnabledRef.current && !force) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    const scheduleTones = () => {
      const startAt = ctx.currentTime + 0.05;
      const tones = [880, 880, 1174.66];

      tones.forEach((frequency, index) => {
        const offset = index * 0.3;
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, startAt + offset);
        gain.gain.setValueAtTime(0.0001, startAt + offset);
        gain.gain.exponentialRampToValueAtTime(0.45, startAt + offset + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + offset + 0.24);

        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(startAt + offset);
        oscillator.stop(startAt + offset + 0.26);

        activeOscillatorsRef.current.push(oscillator);
        oscillator.onended = () => {
          activeOscillatorsRef.current = activeOscillatorsRef.current.filter((node) => node !== oscillator);
        };
      });
    };

    if (ctx.state === 'suspended') {
      ctx
        .resume()
        .then(() => {
          setAudioUnlocked(true);
          scheduleTones();
        })
        .catch(() => {
          // Sin gesto del usuario el navegador puede bloquear el audio.
        });
    } else {
      setAudioUnlocked(true);
      scheduleTones();
    }
  }, [getAudioContext]);

  const refreshOrders = useCallback(() => {
    setOrders(loadOrdersFromStorage());
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  // Refresco visual rápido del tablero. Es independiente de la alarma de 5 min.
  useEffect(() => {
    refreshOrders();
    const interval = window.setInterval(refreshOrders, 3000);
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) refreshOrders();
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [refreshOrders]);

  // Los navegadores bloquean el audio hasta el primer gesto del camarero.
  useEffect(() => {
    function cleanup() {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    }

    function unlock(event: Event) {
      const target = event.target as HTMLElement | null;
      // El botón de sonido gestiona su propio desbloqueo y prueba de tono.
      if (target?.closest('[data-sound-toggle]')) return;
      void unlockAudio();
      cleanup();
    }

    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return cleanup;
  }, [unlockAudio]);

  // Cada 5 minutos comprueba si siguen existiendo cobros en efectivo pendientes.
  useEffect(() => {
    const checkCashAlerts = () => {
      const all = loadOrdersFromStorage();
      const cashTables = new Set(
        all
          .filter((order) => order.status !== 'paid' && order.pagoPendienteEfectivo)
          .map((order) => String(order.table))
      );

      if (cashTables.size === 0) return;

      setAlarmActive(true);
      if (alarmTimeoutRef.current !== null) window.clearTimeout(alarmTimeoutRef.current);
      alarmTimeoutRef.current = window.setTimeout(() => {
        setAlarmActive(false);
        alarmTimeoutRef.current = null;
      }, 5000);

      playCashAlarm();
    };

    checkCashAlerts();
    const interval = window.setInterval(checkCashAlerts, CASH_ALARM_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [playCashAlarm]);

  useEffect(() => {
    return () => {
      activeOscillatorsRef.current.forEach((oscillator) => {
        try {
          oscillator.stop();
        } catch {
          // Sin efecto si ya terminó.
        }
      });
      activeOscillatorsRef.current = [];

      if (alarmTimeoutRef.current !== null) window.clearTimeout(alarmTimeoutRef.current);
      if (feedbackTimeoutRef.current !== null) window.clearTimeout(feedbackTimeoutRef.current);
      audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = null;
    };
  }, []);

  const showFeedback = (message: string) => {
    setFeedback(message);
    if (feedbackTimeoutRef.current !== null) window.clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = window.setTimeout(() => {
      setFeedback('');
      feedbackTimeoutRef.current = null;
    }, 4500);
  };

  async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    const all = loadOrdersFromStorage();
    const now = new Date().toISOString();

    const updated = all.map((order) => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        status: newStatus,
        ...(newStatus === 'confirmed' ? { confirmedAt: now } : {}),
        ...(newStatus === 'served' ? { servedAt: now } : {}),
        ...(newStatus === 'paid' ? { paidAt: now } : {}),
      };
    });

    saveOrdersToStorage(updated);
    refreshOrders();
  }

  function markTableAsCollected(table: string) {
    const all = loadOrdersFromStorage();
    const now = new Date().toISOString();
    let changed = false;

    const updated = all.map((order) => {
      if (String(order.table) !== table || order.status === 'paid') return order;

      changed = true;
      return {
        ...order,
        status: 'paid' as OrderStatus,
        paidAt: now,
        cobradoAt: now,
        pagoPendienteEfectivo: false,
        metodoPago: 'efectivo',
      };
    });

    if (!changed) return;

    saveOrdersToStorage(updated);

    // La referencia de mesa se actualiza para que el cliente vea la mesa libre.
    try {
      const tableRefRaw = localStorage.getItem(`order_${table}`);
      if (tableRefRaw) {
        const tableRef = JSON.parse(tableRefRaw);
        localStorage.setItem(`order_${table}`, JSON.stringify({
          ...tableRef,
          paid: true,
          paidAt: now,
          pagoPendienteEfectivo: false,
          metodoPago: 'efectivo',
        }));
      }
    } catch {
      // La referencia es opcional; el pedido principal ya está actualizado.
    }

    const stillCashPending = updated.some(
      (order) => order.status !== 'paid' && order.pagoPendienteEfectivo
    );
    if (!stillCashPending) stopAlarmSound();

    refreshOrders();
    showFeedback(`Mesa ${table} cobrada y liberada.`);
  }

  const tableGroups = useMemo<TableGroup[]>(() => {
    const groupMap = new Map<string, TableGroup>();

    orders.forEach((order) => {
      if (order.status === 'paid') return;

      const table = String(order.table ?? '');
      if (!table) return;

      let group = groupMap.get(table);
      if (!group) {
        group = {
          table,
          orders: [],
          totalCents: 0,
          cashPending: false,
          pendingCount: 0,
          confirmedCount: 0,
          servedCount: 0,
          lastOrderAt: order.createdAt,
        };
        groupMap.set(table, group);
      }

      group.orders.push(order);
      group.totalCents += orderTotal(order);

      if (order.pagoPendienteEfectivo) group.cashPending = true;
      if (order.status === 'pending') group.pendingCount += 1;
      if (order.status === 'confirmed') group.confirmedCount += 1;
      if (order.status === 'served') group.servedCount += 1;

      if (new Date(order.createdAt).getTime() > new Date(group.lastOrderAt).getTime()) {
        group.lastOrderAt = order.createdAt;
      }
    });

    return [...groupMap.values()]
      .map((group) => ({
        ...group,
        orders: [...group.orders].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
      }))
      .sort((a, b) => a.table.localeCompare(b.table, 'es', { numeric: true }));
  }, [orders]);

  const totalOrders = tableGroups.reduce((sum, group) => sum + group.orders.length, 0);
  const totalPending = tableGroups.reduce((sum, group) => sum + group.pendingCount, 0);
  const cashTables = tableGroups.filter((group) => group.cashPending).length;

  async function handleSoundToggle() {
    if (!soundEnabled) {
      const unlocked = await unlockAudio();
      if (!unlocked) return;
      soundEnabledRef.current = true;
      setSoundEnabled(true);
      playCashAlarm(true);
      return;
    }

    if (!audioUnlocked) {
      const unlocked = await unlockAudio();
      if (unlocked) playCashAlarm(true);
      return;
    }

    soundEnabledRef.current = false;
    setSoundEnabled(false);
    stopAlarmSound();
  }

  return (
    <div className="site-shell grain cocina-shell">
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
          <span className="eyebrow cocina-header-role" style={{ color: '#83915f' }}>Panel de personal</span>
        </div>
      </header>

      <main className="section-wrap cocina-main">
        <div className="cocina-topbar">
          <div>
            <span className="eyebrow">VISTA POR MESA</span>
            <h1 className="serif cocina-title">Pedidos por mesa</h1>
            <p className="cocina-subtitle">
              Todos los pedidos de una mesa, agrupados en una sola tarjeta. Se actualiza automáticamente cada 3 s.
              {lastUpdated
                ? ` · ${lastUpdated.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                : ''}
            </p>
          </div>
          <div className="cocina-topbar-actions">
            <button
              type="button"
              className={`cocina-sound-toggle${soundEnabled && audioUnlocked ? '' : ' is-muted'}`}
              onClick={handleSoundToggle}
              data-sound-toggle
              data-testid="button-sound-toggle"
            >
              {soundEnabled && audioUnlocked
                ? <Volume2 size={15} aria-hidden="true" />
                : <VolumeX size={15} aria-hidden="true" />}
              {soundEnabled && audioUnlocked ? 'Silenciar alerta' : 'Activar sonido'}
            </button>
          </div>
        </div>

        {feedback && <p className="cocina-feedback" role="status">{feedback}</p>}

        <div className="cocina-summary" aria-label="Resumen del panel">
          <span className="cocina-summary-pill"><strong>{tableGroups.length}</strong> {tableGroups.length === 1 ? 'mesa activa' : 'mesas activas'}</span>
          <span className="cocina-summary-pill"><strong>{totalOrders}</strong> {totalOrders === 1 ? 'pedido' : 'pedidos'}</span>
          <span className="cocina-summary-pill"><strong>{totalPending}</strong> {totalPending === 1 ? 'pendiente' : 'pendientes'}</span>
          <span className={`cocina-summary-pill${cashTables > 0 ? ' cocina-summary-pill--alert' : ''}`}>
            <strong>{cashTables}</strong> {cashTables === 1 ? 'cobro en efectivo' : 'cobros en efectivo'}
          </span>
        </div>

        {loading ? (
          <div className="cocina-loader">
            <Clock size={32} style={{ animation: 'page-loader-spin 1.2s linear infinite' }} aria-hidden="true" />
            <p>Cargando pedidos...</p>
          </div>
        ) : tableGroups.length === 0 ? (
          <div className="cocina-empty">
            <h3 className="serif">No hay mesas con pedidos activos</h3>
            <p>Los pedidos aparecerán aquí cuando el cliente pulse «Enviar a cocina».</p>
          </div>
        ) : (
          <div className="cocina-board">
            {tableGroups.map((group) => {
              const hasOrdersInProgress = group.pendingCount > 0 || group.confirmedCount > 0;

              return (
                <section
                  key={group.table}
                  className={`cocina-table-card${group.cashPending ? ' cocina-table-card--cash' : ''}${alarmActive && group.cashPending ? ' cocina-table-card--alarm' : ''}`}
                  aria-label={`Mesa ${group.table}`}
                  data-testid={`card-table-${group.table}`}
                >
                  <header className="cocina-table-head">
                    <div>
                      <span className="cocina-table-kicker">Mesa</span>
                      <h3 className="serif">{group.table}</h3>
                    </div>
                    <div className="cocina-table-meta">
                      <strong>{group.orders.length} {group.orders.length === 1 ? 'pedido' : 'pedidos'}</strong>
                      <span>Último: {formatTime(group.lastOrderAt)}</span>
                      <span>Total: {formatPrice(group.totalCents)}</span>
                    </div>
                  </header>

                  {group.cashPending && (
                    <div
                      className="cocina-cash-badge"
                      role="status"
                      aria-live="assertive"
                      data-testid={`badge-cash-table-${group.table}`}
                    >
                      COBRO PENDIENTE 💶
                    </div>
                  )}

                  <div className="cocina-table-statuses">
                    {group.pendingCount > 0 && (
                      <span className="cocina-status-chip cocina-status-chip--pending">Pendiente · {group.pendingCount}</span>
                    )}
                    {group.confirmedCount > 0 && (
                      <span className="cocina-status-chip cocina-status-chip--confirmed">Confirmado · {group.confirmedCount}</span>
                    )}
                    {group.servedCount > 0 && (
                      <span className="cocina-status-chip cocina-status-chip--served">Servido · {group.servedCount}</span>
                    )}
                  </div>

                  <div className="cocina-order-list">
                    {group.orders.map((order) => (
                      <article
                        key={order.id}
                        className={`cocina-order${order.status === 'pending' ? ' cocina-order--pending' : ''}`}
                      >
                        <div className="cocina-order-head">
                          <span className="cocina-order-time">{formatTime(order.createdAt)}</span>
                          <span className={`cocina-status cocina-status--${order.status}`}>
                            {statusLabel[order.status]}
                          </span>
                        </div>

                        <ul className="cocina-order-items">
                          {(order.items ?? []).map((item, index) => (
                            <li key={`${order.id}-${item.id}-${index}`}>
                              <span className="cocina-item-qty">{item.quantity}×</span>
                              <span className="cocina-item-name">
                                {item.name}
                                {(item.sizeLabel || item.variant) && (
                                  <small>{[item.sizeLabel, item.variant].filter(Boolean).join(' · ')}</small>
                                )}
                              </span>
                              <strong className="cocina-item-price">
                                {formatPrice((item.priceCents || 0) * item.quantity)}
                              </strong>
                            </li>
                          ))}
                        </ul>

                        <div className="cocina-order-foot">
                          <span className="cocina-order-total">{formatPrice(orderTotal(order))}</span>
                          <div className="cocina-order-actions">
                            {order.status === 'pending' && (
                              <button
                                type="button"
                                className="cocina-action cocina-action--confirm"
                                onClick={() => { void updateOrderStatus(order.id, 'confirmed'); }}
                                data-testid={`button-confirm-${order.id}`}
                              >
                                <Check size={13} aria-hidden="true" /> Confirmar
                              </button>
                            )}
                            {order.status === 'confirmed' && (
                              <>
                                <button
                                  type="button"
                                  className="cocina-action cocina-action--serve"
                                  onClick={() => { void updateOrderStatus(order.id, 'served'); }}
                                  data-testid={`button-serve-${order.id}`}
                                >
                                  <Check size={13} aria-hidden="true" /> Servido
                                </button>
                                <button
                                  type="button"
                                  className="cocina-action cocina-action--reset"
                                  onClick={() => { void updateOrderStatus(order.id, 'pending'); }}
                                  data-testid={`button-reset-${order.id}`}
                                >
                                  <RotateCcw size={13} aria-hidden="true" /> Reiniciar
                                </button>
                              </>
                            )}
                            {order.status === 'served' && (
                              <span className="cocina-served-note">Servido · pendiente de cobro</span>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  <footer className="cocina-table-foot">
                    <div className="cocina-table-total">
                      <span>Total mesa</span>
                      <strong>{formatPrice(group.totalCents)}</strong>
                    </div>
                    <button
                      type="button"
                      className={`cocina-collect-btn${group.cashPending ? ' cocina-collect-btn--cash' : ''}`}
                      onClick={() => markTableAsCollected(group.table)}
                      disabled={hasOrdersInProgress && !group.cashPending}
                      title={hasOrdersInProgress && !group.cashPending ? 'Sirve todos los pedidos antes de cobrar la mesa' : undefined}
                      data-testid={`button-collect-table-${group.table}`}
                    >
                      <Banknote size={15} aria-hidden="true" /> Marcar como Cobrado
                    </button>
                  </footer>
                </section>
              );
            })}
          </div>
        )}
      </main>

      <footer className="site-footer">
        <div className="footer-main section-wrap">
          <span className="footer-tagline serif">Cafés de Carla — Cocina</span>
          <span style={{ fontSize: '10px', color: '#9a8b75' }}>
            Panel solo para personal del local · Datos en memoria local
          </span>
        </div>
      </footer>
    </div>
  );
}
