import { useEffect, useState } from 'react';
import { Check, X, Clock, RefreshCw } from 'lucide-react';

type Producto = {
  id: number;
  id_de_serie: string;
  nombre: string;
  precio: number;
  categoria: string;
  agotado: boolean;
  creado_en: string;
  actualizado_en: string;
};

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

export default function Admin() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar productos desde la API
  useEffect(() => {
    fetchProductos();
    const interval = setInterval(fetchProductos, 5000); // Refrescar cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  async function fetchProductos() {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      if (!res.ok) {
        throw new Error(`Error ${res.status} al cargar productos`);
      }
      const data = await res.json();
      setProductos(data.productos || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error cargando productos');
      console.error('Error cargando productos:', err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleAgotado(producto: Producto) {
    const nuevoEstado = !producto.agotado;
    setUpdating((prev) => new Set([...prev, producto.id]));
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/products/${producto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agotado: nuevoEstado }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `Error ${res.status} al actualizar producto`);
      }

      const data = await res.json();
      setProductos((prev) =>
        prev.map((p) =>
          p.id === producto.id ? { ...p, agotado: data.producto.agotado } : p
        )
      );
      setSuccess(`Producto "${producto.nombre}" actualizado correctamente`);
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

  if (loading) {
    return (
      <div className="site-shell grain min-h-[100dvh]">
        <header className="site-header">
          <div className="header-inner section-wrap">
            <a href="/" className="brand-link focus-ring">
              <span className="serif">Cafés de Carla</span>
            </a>
            <a href="/" className="text-cta focus-ring">Volver a la carta</a>
          </div>
        </header>
        <main className="section-wrap" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Clock size={48} style={{ animation: 'spin 2s linear infinite', display: 'block', margin: '0 auto 16px' }} />
          <h2 className="serif" style={{ fontSize: '28px', margin: '0 0 16px' }}>Cargando administración...</h2>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="site-shell grain min-h-[100dvh]">
        <header className="site-header">
          <div className="header-inner section-wrap">
            <a href="/" className="brand-link focus-ring">
              <span className="serif">Cafés de Carla</span>
            </a>
            <a href="/" className="text-cta focus-ring">Volver a la carta</a>
          </div>
        </header>
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
      <header className="site-header">
        <div className="header-inner section-wrap">
          <a href="/" className="brand-link focus-ring">
            <span className="serif">Cafés de Carla</span>
          </a>
          <a href="/" className="text-cta focus-ring">Volver a la carta</a>
        </div>
      </header>

      <main className="section-wrap" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h1 className="serif" style={{ fontSize: '32px', margin: '0' }}>Panel de Administración</h1>
              <p style={{ color: '#7c6f5e', margin: '8px 0 0' }}>
                Gestiona el estado de disponibilidad (agotado/disponible) de los productos en la base de datos Neon.
              </p>
            </div>
            {success && (
              <div style={{
                background: '#f0f7ed',
                border: '1px solid #81945b',
                color: '#4a5d36',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <Check size={16} style={{ flexShrink: 0 }} />
                <span>{success}</span>
              </div>
            )}
          </div>

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
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
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#4a3322', margin: '4px 0 4px' }}>
                      {producto.nombre}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#7c6f5e', fontSize: '13px' }}>
                      <span>ID: {producto.id_de_serie}</span>
                      <span>•</span>
                      <span>{formatPrice(producto.precio)}</span>
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
