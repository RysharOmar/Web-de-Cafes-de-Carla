import { useEffect, useState, type FormEvent } from 'react';
import { Check, X, Clock, RefreshCw, Lock, LogOut } from 'lucide-react';
import type { ApiProducto } from '@/lib/products';

const PASSWORD_STORAGE_KEY = 'cafes_de_carla_admin_password';

function formatEuros(value: number | null | undefined) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
}

async function verifyPassword(candidate: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: candidate }),
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok) return { ok: true };
    return { ok: false, error: data.error || 'Contraseña incorrecta' };
  } catch {
    return { ok: false, error: 'No se pudo conectar con el servidor' };
  }
}

function Header({ onLogout }: { onLogout?: () => void }) {
  return (
    <header className="site-header">
      <div className="header-inner section-wrap">
        <a href="/" className="brand-link focus-ring">
          <span className="serif">Cafés de Carla</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <a href="/" className="text-cta focus-ring">Volver a la carta</a>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="focus-ring"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: '1px solid #ddd1bd',
                borderRadius: '99px',
                padding: '8px 14px',
                color: '#7c6f5e',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <LogOut size={13} aria-hidden="true" />
              Cerrar sesión
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default function Admin() {
  const [password, setPassword] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [productos, setProductos] = useState<ApiProducto[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Recuperar la sesión del panel al recargar la página.
  useEffect(() => {
    const saved = sessionStorage.getItem(PASSWORD_STORAGE_KEY);

    if (!saved) {
      setAuthLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      const result = await verifyPassword(saved);
      if (cancelled) return;

      if (result.ok) {
        setPassword(saved);
      } else {
        sessionStorage.removeItem(PASSWORD_STORAGE_KEY);
        setAuthError(result.error || null);
      }
      setAuthLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function fetchProductos() {
    try {
      setLoading(true);
      const res = await fetch('/api/products', { cache: 'no-store' });

      if (!res.ok) {
        throw new Error(`Error ${res.status} al cargar productos`);
      }

      const data = await res.json();
      setProductos(Array.isArray(data.productos) ? data.productos : []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error cargando productos');
      console.error('Error cargando productos:', err);
    } finally {
      setLoading(false);
    }
  }

  // Cargar productos y refrescar cada 5 segundos mientras haya sesión.
  useEffect(() => {
    if (!password) return;

    fetchProductos();
    const interval = setInterval(fetchProductos, 5000);
    return () => clearInterval(interval);
  }, [password]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError(null);

    if (!passwordInput.trim()) {
      setAuthError('Introduce la contraseña');
      return;
    }

    setAuthLoading(true);
    const result = await verifyPassword(passwordInput);
    setAuthLoading(false);

    if (!result.ok) {
      setAuthError(result.error || 'Contraseña incorrecta');
      return;
    }

    sessionStorage.setItem(PASSWORD_STORAGE_KEY, passwordInput);
    setPassword(passwordInput);
    setPasswordInput('');
    setProductos([]);
    setError(null);
    setLoading(true);
  }

  function logout() {
    sessionStorage.removeItem(PASSWORD_STORAGE_KEY);
    setPassword('');
    setProductos([]);
    setError(null);
    setSuccess(null);
    setAuthError(null);
  }

  async function toggleAgotado(producto: ApiProducto) {
    const nuevoEstado = !producto.agotado;
    setUpdating((prev) => new Set([...prev, producto.id]));
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/products', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify({ id: producto.id, agotado: nuevoEstado }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        logout();
        setAuthError(data.error || 'La sesión ha caducado. Vuelve a entrar.');
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status} al actualizar producto`);
      }

      setProductos((prev) =>
        prev.map((p) =>
          p.id === producto.id ? { ...p, ...data.producto } : p,
        ),
      );
      setSuccess(
        `"${producto.nombre}" ${data.producto.agotado ? 'marcado como agotado' : 'marcado como disponible'}.`,
      );
    } catch (err: any) {
      setError(err.message || 'Error actualizando producto');
      console.error('Error actualizando producto:', err);
    } finally {
      setUpdating((prev) => {
        const next = new Set(prev);
        next.delete(producto.id);
        return next;
      });
    }
  }

  // Pantalla mientras se comprueba la sesión guardada.
  if (authLoading && !password && !passwordInput) {
    return (
      <div className="site-shell grain min-h-[100dvh]">
        <Header />
        <main className="section-wrap" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Clock size={48} style={{ animation: 'spin 2s linear infinite', display: 'block', margin: '0 auto 16px' }} />
          <h2 className="serif" style={{ fontSize: '28px', margin: '0 0 16px' }}>Comprobando acceso...</h2>
        </main>
      </div>
    );
  }

  // Formulario de contraseña.
  if (!password) {
    return (
      <div className="site-shell grain min-h-[100dvh]">
        <Header />
        <main className="section-wrap" style={{ padding: '60px 20px', display: 'flex', justifyContent: 'center' }}>
          <form
            onSubmit={handleLogin}
            style={{
              width: '100%',
              maxWidth: '430px',
              padding: '34px',
              background: '#fff',
              border: '1px solid #ddd1bd',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(74, 51, 34, 0.08)',
            }}
          >
            <Lock size={34} style={{ color: '#81945b', display: 'block', margin: '0 auto 14px' }} />
            <h1 className="serif" style={{ fontSize: '28px', textAlign: 'center', margin: '0 0 8px' }}>
              Panel de Administración
            </h1>
            <p style={{ color: '#7c6f5e', textAlign: 'center', margin: '0 0 24px', fontSize: '14px' }}>
              Introduce la contraseña para gestionar la disponibilidad de los productos.
            </p>

            <label htmlFor="admin-password" style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4a3322', marginBottom: '8px' }}>
              Contraseña
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              autoFocus
              required
              value={passwordInput}
              onChange={(event) => setPasswordInput(event.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '11px 12px',
                border: '1px solid #ddd1bd',
                borderRadius: '8px',
                fontSize: '15px',
                marginBottom: '16px',
                outlineColor: '#81945b',
              }}
            />

            {authError && (
              <p role="alert" style={{ color: '#a33a2b', fontSize: '13px', margin: '0 0 14px' }}>
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="focus-ring"
              style={{
                width: '100%',
                background: '#81945b',
                color: '#fff',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: authLoading ? 'wait' : 'pointer',
                opacity: authLoading ? 0.7 : 1,
              }}
            >
              {authLoading ? 'Comprobando...' : 'Entrar'}
            </button>
          </form>
        </main>
      </div>
    );
  }

  // Pantalla de carga inicial de productos.
  if (loading && productos.length === 0 && !error) {
    return (
      <div className="site-shell grain min-h-[100dvh]">
        <Header onLogout={logout} />
        <main className="section-wrap" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Clock size={48} style={{ animation: 'spin 2s linear infinite', display: 'block', margin: '0 auto 16px' }} />
          <h2 className="serif" style={{ fontSize: '28px', margin: '0 0 16px' }}>Cargando administración...</h2>
        </main>
      </div>
    );
  }

  // Error inicial sin productos.
  if (error && productos.length === 0) {
    return (
      <div className="site-shell grain min-h-[100dvh]">
        <Header onLogout={logout} />
        <main className="section-wrap" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '500px', margin: '0 auto', padding: '40px', background: '#fffbeb', border: '1px solid #ddd1bd', borderRadius: '12px' }}>
            <Clock size={32} style={{ color: '#b9aa95', display: 'block', margin: '0 auto 16px' }} />
            <h2 className="serif" style={{ fontSize: '24px', color: '#4a3322', margin: '0 0 12px' }}>Error cargando productos</h2>
            <p style={{ color: '#7c6f5e', margin: '0 0 20px' }}>{error}</p>
            <button
              onClick={fetchProductos}
              className="focus-ring"
              style={{
                background: '#81945b',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={16} style={{ marginRight: '8px' }} />
              Reintentar
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="site-shell grain min-h-[100dvh]">
      <Header onLogout={logout} />

      <main className="section-wrap" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 className="serif" style={{ fontSize: '32px', margin: '0' }}>Panel de Administración</h1>
            <p style={{ color: '#7c6f5e', margin: '8px 0 0' }}>
              Gestiona la disponibilidad de los productos en Neon. Los cambios se reflejan en la carta y en el checkout.
            </p>
          </div>

          {error && (
            <div role="alert" style={{ background: '#fdf0ed', border: '1px solid #d9a79b', color: '#8a3223', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: '#f0f7ed', border: '1px solid #81945b', color: '#4a5d36', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Check size={16} style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          {productos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7c6f5e' }}>
              <Clock size={48} style={{ marginBottom: '16px', opacity: '.5' }} />
              <p style={{ fontSize: '18px', margin: '0' }}>No hay productos en la base de datos</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {productos.map((producto) => (
                <div
                  key={producto.id}
                  style={{
                    border: '1px solid #ddd1bd',
                    borderRadius: '12px',
                    padding: '20px',
                    background: producto.agotado ? '#fffbeb' : '#fff',
                    boxShadow: '0 4px 12px rgba(74, 51, 34, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '99px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: producto.agotado ? '#b9aa95' : '#6b7d4c',
                          background: producto.agotado ? '#f0f0ea' : '#f0f7ed',
                        }}
                      >
                        {producto.agotado ? 'AGOTADO' : 'DISPONIBLE'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#9a8b75' }}>{producto.categoria}</span>
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#4a3322', margin: '4px 0' }}>
                      {producto.nombre}
                    </h3>

                    {producto.descripcion && (
                      <p style={{ fontSize: '13px', color: '#7c6f5e', margin: '0 0 6px', maxWidth: '560px' }}>
                        {producto.descripcion}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#7c6f5e', fontSize: '13px', flexWrap: 'wrap' }}>
                      <span>ID: {producto.id}</span>
                      <span>•</span>
                      <span>Normal: {formatEuros(producto.precio)}</span>
                      {producto.precio_mini !== null && (
                        <>
                          <span>•</span>
                          <span>Mini: {formatEuros(producto.precio_mini)}</span>
                        </>
                      )}
                      {producto.precio_grande !== null && (
                        <>
                          <span>•</span>
                          <span>Grande: {formatEuros(producto.precio_grande)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => toggleAgotado(producto)}
                      disabled={updating.has(producto.id)}
                      className="focus-ring"
                      style={{
                        background: producto.agotado ? '#81945b' : '#b9aa95',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 18px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: updating.has(producto.id) ? 'not-allowed' : 'pointer',
                        opacity: updating.has(producto.id) ? 0.6 : 1,
                        transition: 'background 0.2s, opacity 0.2s',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {updating.has(producto.id) ? (
                        <Clock size={14} style={{ animation: 'spin 2s linear infinite' }} />
                      ) : producto.agotado ? (
                        <>
                          <Check size={14} style={{ marginRight: '6px' }} />
                          Marcar Disponible
                        </>
                      ) : (
                        <>
                          <X size={14} style={{ marginRight: '6px' }} />
                          Marcar como Agotado
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
