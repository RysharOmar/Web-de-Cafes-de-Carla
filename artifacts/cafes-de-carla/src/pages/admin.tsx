import { useEffect, useState, type FormEvent } from 'react';
import { useLocation } from 'wouter';
import { Check, X, Clock, Lock, RefreshCw, LogOut } from 'lucide-react';
import type { ApiProducto } from '@/lib/products';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { authFetch } from '@/lib/auth-fetch';

function formatEuros(value: number | null | undefined) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
}

function Header({ onLogout }: { onLogout?: () => void }) {
  const { t } = useLanguage();
  return (
    <header className="site-header">
      <div className="header-inner section-wrap" style={{ paddingBlock: '12px' }}>
        <span className="serif" style={{ fontSize: '20px', color: '#4a3322' }}>Cafés de Carla · {t('Panel de Administración')}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
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
              {t('Cerrar sesión')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default function Admin() {
  const [, navigate] = useLocation();
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const [productos, setProductos] = useState<ApiProducto[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<ApiProducto | null>(null);
  const [editForm, setEditForm] = useState<{
    nombre: string;
    nombre_en: string | null;
    precio: string;
    precio_mini: string | null;
    precio_grande: string | null;
    categoria: string;
    categoria_en: string | null;
    descripcion: string | null;
    descripcion_en: string | null;
    imagen_url: string | null;
    agotado: boolean;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'disponibilidad' | 'edicion'>('disponibilidad');
  const [filter, setFilter] = useState<'todos' | 'disponibles' | 'agotados'>('todos');
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [nuevaCategoria, setNuevaCategoria] = useState('');

  async function fetchProductos() {
    try {
      setLoading(true);
      const res = await authFetch('/api/products', { cache: 'no-store' });

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

  async function fetchCategorias() {
    try {
      const res = await authFetch('/api/categories', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.categorias)) {
        setCategorias(
          data.categorias.filter((c: unknown) => typeof c === 'string' && c.trim() !== ''),
        );
      }
    } catch (err) {
      console.error('Error cargando categorías:', err);
    }
  }

  // Cargar productos y refrescar cada 5 segundos mientras haya sesión.
  // Se pausa la recarga automática mientras se está editando un producto
  // para no sobrescribir cambios en curso.
  useEffect(() => {
    if (editingProduct) return;

    fetchProductos();
    fetchCategorias();
    const interval = setInterval(fetchProductos, 5000);
    return () => clearInterval(interval);
  }, [editingProduct]);

  async function logout() {
    await signOut();
    setProductos([]);
    setError(null);
    setSuccess(null);
    navigate('/login');
  }

  async function toggleAgotado(producto: ApiProducto) {
    const nuevoEstado = !producto.agotado;
    setUpdating((prev) => new Set([...prev, producto.id]));
    setError(null);
    setSuccess(null);

    try {
      const res = await authFetch(`/api/products/${producto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agotado: nuevoEstado }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        void logout();
        setError(data.error || 'La sesión ha caducado. Vuelve a entrar.');
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status} al actualizar producto`);
      }

      // Actualizar la lista local para reflejar el cambio inmediatamente.
      setProductos((prev) =>
        prev.map((p) =>
          p.id === producto.id
            ? { ...p, agotado: nuevoEstado, ...(data.producto || {}) }
            : p,
        ),
      );
      setSuccess(
        `"${producto.nombre}" ${nuevoEstado ? 'marcado como agotado' : 'marcado como disponible'}.`,
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

  async function eliminarProducto(producto: ApiProducto) {
    if (!window.confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setUpdating((prev) => new Set([...prev, producto.id]));
    setError(null);
    setSuccess(null);

    try {
      const res = await authFetch(`/api/products/${producto.id}`, { method: 'DELETE' });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        void logout();
        setError(data.error || 'La sesión ha caducado. Vuelve a entrar.');
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status} al eliminar producto`);
      }

      setProductos((prev) => prev.filter((p) => p.id !== producto.id));
      setSuccess(`"${producto.nombre}" eliminado correctamente.`);
    } catch (err: any) {
      setError(err.message || 'Error eliminando producto');
      console.error('Error eliminando producto:', err);
    } finally {
      setUpdating((prev) => {
        const next = new Set(prev);
        next.delete(producto.id);
        return next;
      });
    }
  }

  // --- Funciones de edición de producto (modal) ---

  const openEdit = (producto: ApiProducto) => {
    console.log("Abriendo modal para:", producto.nombre);
    setIsAdding(false);
    setEditingProduct(producto);
    setEditForm({
      nombre: producto.nombre,
      nombre_en: producto.nombre_en ?? '',
      precio: String(producto.precio ?? ''),
      precio_mini: producto.precio_mini !== null ? String(producto.precio_mini) : '',
      precio_grande: producto.precio_grande !== null ? String(producto.precio_grande) : '',
      categoria: producto.categoria,
      categoria_en: producto.categoria_en ?? '',
      descripcion: producto.descripcion ?? '',
      descripcion_en: producto.descripcion_en ?? '',
      imagen_url: producto.imagen_url ?? '',
      agotado: Boolean(producto.agotado),
    });
    setNuevaCategoria('');
    setError(null);
    setSuccess(null);
    setImagePreview(null);
  };

  const closeEdit = () => {
    setEditingProduct(null);
    setEditForm(null);
    setIsAdding(false);
    setImagePreview(null);
    setUploadError(null);
    setNuevaCategoria('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await authFetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Error al subir la imagen');

      setEditForm(prev => prev ? { ...prev, imagen_url: data.url } : null);
      setImagePreview(data.url);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const openAdd = () => {
    setEditForm({
      nombre: '',
      nombre_en: '',
      precio: '',
      precio_mini: null,
      precio_grande: null,
      categoria: '',
      categoria_en: '',
      descripcion: null,
      descripcion_en: '',
      imagen_url: null,
      agotado: false,
    });
    setEditingProduct(null);
    setIsAdding(true);
    setNuevaCategoria('');
    setError(null);
    setSuccess(null);
    setImagePreview(null);
  };

  const handleEditChange = (field: string, value: string | null | boolean) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [field]: value });
  };

  const handleSaveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editForm) return;
    if (!isAdding && !editingProduct) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const body: Record<string, unknown> = {};

      const nombre = String(editForm.nombre).trim();
      if (nombre === '') {
        setError('El nombre no puede estar vacío');
        setSaving(false);
        return;
      }
      body.nombre = nombre;

      const precioNum = Number(editForm.precio);
      if (!Number.isFinite(precioNum) || precioNum < 0) {
        setError('El precio normal debe ser un número válido (>= 0)');
        setSaving(false);
        return;
      }
      body.precio = precioNum;

      if (editForm.precio_mini === null || editForm.precio_mini === '') {
        body.precio_mini = null;
      } else {
        const pm = Number(editForm.precio_mini);
        if (!Number.isFinite(pm) || pm < 0) {
          setError('El precio mini debe ser un número válido (>= 0) o vacío');
          setSaving(false);
          return;
        }
        body.precio_mini = pm;
      }

      if (editForm.precio_grande === null || editForm.precio_grande === '') {
        body.precio_grande = null;
      } else {
        const pg = Number(editForm.precio_grande);
        if (!Number.isFinite(pg) || pg < 0) {
          setError('El precio grande debe ser un número válido (>= 0) o vacío');
          setSaving(false);
          return;
        }
        body.precio_grande = pg;
      }

      const categoriaFinal =
        editForm.categoria === '__nueva__'
          ? nuevaCategoria.trim()
          : String(editForm.categoria).trim();

      if (categoriaFinal === '') {
        setError('La categoría es obligatoria');
        setSaving(false);
        return;
      }
      body.categoria = categoriaFinal;
      body.nombre_en = editForm.nombre_en?.trim() || null;
      body.descripcion_en = editForm.descripcion_en?.trim() || null;
      body.categoria_en = editForm.categoria_en?.trim() || null;
      body.descripcion = editForm.descripcion ?? null;
      body.imagen_url = editForm.imagen_url ?? null;
      body.agotado = Boolean(editForm.agotado);

      const isCreating = isAdding;

      const res = await authFetch(isCreating ? '/api/products' : `/api/products/${editingProduct!.id}`, {
        method: isCreating ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        void logout();
        setError(data.error || 'La sesión ha caducado. Vuelve a entrar.');
        setSaving(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status} al ${isCreating ? 'crear' : 'actualizar'} producto`);
      }

      // Refrescar la lista inmediatamente
      await fetchProductos();
      fetchCategorias();

      setSuccess(
        `"${body.nombre}" ${isCreating ? 'creado correctamente.' : 'actualizado correctamente.'}`,
      );
      closeEdit();
    } catch (err: any) {
      setError(err.message || `Error al ${isAdding ? 'crear' : 'actualizar'} producto`);
      console.error(`Error guardando ${isAdding ? 'creación' : 'edición'}:`, err);
    } finally {
      setSaving(false);
    }
  };

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

  const filteredProductos = productos.filter((p) => {
    if (filter === 'disponibles') return !p.agotado;
    if (filter === 'agotados') return p.agotado;
    return true;
  });

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

          {/* Pestañas */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #ddd1bd', paddingBottom: '12px' }}>
            <button
              onClick={() => setActiveTab('disponibilidad')}
              className="focus-ring"
              style={{
                border: 'none',
                background: activeTab === 'disponibilidad' ? '#81945b' : 'transparent',
                color: activeTab === 'disponibilidad' ? '#fff' : '#4a3322',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                opacity: activeTab === 'disponibilidad' ? 1 : 0.7,
              }}
            >
              DISPONIBILIDAD
            </button>
            <button
              onClick={() => setActiveTab('edicion')}
              className="focus-ring"
              style={{
                border: 'none',
                background: activeTab === 'edicion' ? '#81945b' : 'transparent',
                color: activeTab === 'edicion' ? '#fff' : '#4a3322',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                opacity: activeTab === 'edicion' ? 1 : 0.7,
              }}
            >
              EDITAR CARTA
            </button>
          </div>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              onClick={() => setFilter('todos')}
              className="focus-ring"
              style={{
                border: '1px solid #ddd1bd',
                background: filter === 'todos' ? '#81945b' : '#fff',
                color: filter === 'todos' ? '#fff' : '#4a3322',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              TODOS
            </button>
            <button
              onClick={() => setFilter('disponibles')}
              className="focus-ring"
              style={{
                border: '1px solid #ddd1bd',
                background: filter === 'disponibles' ? '#81945b' : '#fff',
                color: filter === 'disponibles' ? '#fff' : '#4a3322',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              DISPONIBLES
            </button>
            <button
              onClick={() => setFilter('agotados')}
              className="focus-ring"
              style={{
                border: '1px solid #ddd1bd',
                background: filter === 'agotados' ? '#81945b' : '#fff',
                color: filter === 'agotados' ? '#fff' : '#4a3322',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              AGOTADOS
            </button>
          </div>

          {productos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7c6f5e' }}>
              <Clock size={48} style={{ marginBottom: '16px', opacity: '.5' }} />
              <p style={{ fontSize: '18px', margin: '0' }}>No hay productos en la base de datos</p>
            </div>
          ) : (
            <>
              {activeTab === 'edicion' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#7c6f5e', fontWeight: 600 }}>
                    {filteredProductos.length} producto{filteredProductos.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={openAdd}
                    className="focus-ring"
                    style={{
                      border: '1px solid #81945b',
                      background: 'transparent',
                      color: '#81945b',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    + Agregar Producto
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredProductos.map((producto) => {
                  const initials = producto.nombre
                    .split(' ')
                    .map((w) => w.charAt(0).toUpperCase())
                    .slice(0, 2)
                    .join('');

                  return (
                    <div
                      key={producto.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        border: '1px solid #ddd1bd',
                        borderRadius: '10px',
                        background: producto.agotado ? '#fffbeb' : '#fff',
                        boxShadow: '0 2px 8px rgba(74, 51, 34, 0.06)',
                      }}
                    >
                      {/* Iniciales del producto */}
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: '#e8dfd4',
                          color: '#4a3322',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        {initials}
                      </div>

                      {/* Información del producto */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '99px',
                              fontSize: '10px',
                              fontWeight: 700,
                              color: producto.agotado ? '#b9aa95' : '#6b7d4c',
                              background: producto.agotado ? '#f0f0ea' : '#f0f7ed',
                            }}
                          >
                            {producto.agotado ? 'AGOTADO' : 'DISPONIBLE'}
                          </span>
                          <span style={{ fontSize: '10px', color: '#9a8b75' }}>{producto.categoria}</span>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#4a3322' }}>{producto.nombre}</div>
                        <div style={{ display: 'flex', gap: '10px', color: '#7c6f5e', fontSize: '12px', marginTop: '2px' }}>
                          <span>Normal: {formatEuros(producto.precio)}</span>
                          {producto.precio_mini !== null && <span>• Mini: {formatEuros(producto.precio_mini)}</span>}
                          {producto.precio_grande !== null && <span>• Grande: {formatEuros(producto.precio_grande)}</span>}
                        </div>
                      </div>

                      {/* Acciones */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {activeTab === 'disponibilidad' ? (
                          <button
                            onClick={() => toggleAgotado(producto)}
                            disabled={updating.has(producto.id)}
                            className="focus-ring"
                            style={{
                              background: producto.agotado ? '#81945b' : '#b9aa95',
                              color: '#fff',
                              border: 'none',
                              padding: '8px 14px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: updating.has(producto.id) ? 'not-allowed' : 'pointer',
                              opacity: updating.has(producto.id) ? 0.6 : 1,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {producto.agotado ? 'Disponible' : 'Agotado'}
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => openEdit(producto)}
                              disabled={updating.has(producto.id) || editingProduct !== null}
                              className="focus-ring"
                              style={{
                                background: '#4a3322',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: updating.has(producto.id) || editingProduct !== null ? 'not-allowed' : 'pointer',
                                opacity: (updating.has(producto.id) || editingProduct !== null) ? 0.6 : 1,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => eliminarProducto(producto)}
                              disabled={updating.has(producto.id)}
                              className="focus-ring"
                              style={{
                                background: '#a33a2b',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: updating.has(producto.id) ? 'not-allowed' : 'pointer',
                                opacity: updating.has(producto.id) ? 0.6 : 1,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modal Editar Producto */}
      {editForm && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(74, 51, 34, 0.35)',
              backdropFilter: 'blur(2px)',
            }}
            onClick={closeEdit}
          >
            <div
              style={{
                background: '#fff',
                border: '1px solid #ddd1bd',
                borderRadius: '12px',
                padding: '24px',
                width: '100%',
                maxWidth: '520px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow:
                  '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '20px',
                }}
              >
                <Lock size={24} style={{ color: '#81945b' }} />
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#4a3322',
                    margin: 0,
                  }}
                >
                  {isAdding ? 'Agregar producto' : 'Editar producto'}
                </h2>
                <button
                  onClick={closeEdit}
                  style={{
                    marginLeft: 'auto',
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#7c6f5e',
                  }}
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleSaveEdit}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#4a3322' }}>Nombre</label>
                  <input
                    type="text"
                    value={editForm.nombre}
                    onChange={(e) => handleEditChange('nombre', e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #ddd1bd', borderRadius: '8px', fontSize: '14px' }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#4a3322' }}>{t('Nombre (EN)')}</label>
                  <input
                    type="text"
                    value={editForm.nombre_en ?? ''}
                    onChange={(e) => handleEditChange('nombre_en', e.target.value || null)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #ddd1bd', borderRadius: '8px', fontSize: '14px' }}
                    placeholder="English name (optional)"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label
                    htmlFor="edit-categoria"
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#4a3322',
                    }}
                  >
                    Categoría
                  </label>
                  <select
                    id="edit-categoria"
                    value={editForm.categoria}
                    onChange={(e) => handleEditChange('categoria', e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      border: '1px solid #ddd1bd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: '#fff',
                    }}
                    required
                  >
                    <option value="" disabled>
                      Selecciona una categoría
                    </option>
                    {Array.from(
                      new Set([
                        ...categorias,
                        ...(editForm.categoria && editForm.categoria !== '__nueva__'
                          ? [editForm.categoria]
                          : []),
                      ]),
                    ).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__nueva__">+ Crear nueva categoría</option>
                  </select>
                  {editForm.categoria === '__nueva__' && (
                    <input
                      type="text"
                      placeholder="Nombre de la nueva categoría"
                      value={nuevaCategoria}
                      onChange={(e) => setNuevaCategoria(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #ddd1bd', borderRadius: '8px', fontSize: '14px' }}
                    />
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#4a3322' }}>{t('Categoría (EN)')}</label>
                  <input
                    type="text"
                    value={editForm.categoria_en ?? ''}
                    onChange={(e) => handleEditChange('categoria_en', e.target.value || null)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #ddd1bd', borderRadius: '8px', fontSize: '14px' }}
                    placeholder="English category (optional)"
                  />
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#4a3322',
                      }}
                    >
                      Precio Normal (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editForm.precio}
                      onChange={(e) => handleEditChange('precio', e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 12px',
                        border: '1px solid #ddd1bd',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#4a3322',
                      }}
                    >
                      Precio Mini (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editForm.precio_mini ?? ''}
                      onChange={(e) => handleEditChange('precio_mini', e.target.value || null)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 12px',
                        border: '1px solid #ddd1bd',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#4a3322',
                      }}
                    >
                      Precio Grande (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editForm.precio_grande ?? ''}
                      onChange={(e) => handleEditChange('precio_grande', e.target.value || null)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 12px',
                        border: '1px solid #ddd1bd',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#4a3322' }}>Descripción</label>
                  <textarea
                    value={editForm.descripcion ?? ''}
                    onChange={(e) => handleEditChange('descripcion', e.target.value || null)}
                    rows={2}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #ddd1bd', borderRadius: '8px', fontSize: '14px' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#4a3322' }}>{t('Descripción (EN)')}</label>
                  <textarea
                    value={editForm.descripcion_en ?? ''}
                    onChange={(e) => handleEditChange('descripcion_en', e.target.value || null)}
                    rows={2}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #ddd1bd', borderRadius: '8px', fontSize: '14px' }}
                    placeholder="English description (optional)"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#4a3322',
                    }}
                  >
                    URL de imagen
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={editForm.imagen_url ?? ''}
                      onChange={(e) =>
                        handleEditChange('imagen_url', e.target.value || null)
                      }
                      style={{
                        flex: 1,
                        boxSizing: 'border-box',
                        padding: '10px 12px',
                        border: '1px solid #ddd1bd',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      disabled={uploading}
                      className="focus-ring"
                      style={{
                        padding: '10px 16px',
                        border: '1px solid #81945b',
                        background: uploading ? '#ddd1bd' : '#fff',
                        color: '#81945b',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: uploading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {uploading ? 'Subiendo...' : 'Subir foto'}
                    </button>
                  </div>
                  {imagePreview && (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img
                        src={imagePreview}
                        alt="Vista previa"
                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd1bd' }}
                      />
                      <span style={{ fontSize: '12px', color: '#6b7d4c', fontWeight: 600 }}>Lista</span>
                    </div>
                  )}
                  {uploadError && (
                    <p style={{ color: '#a33a2b', fontSize: '12px', marginTop: '6px' }}>{uploadError}</p>
                  )}
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <input
                    id="edit-agotado"
                    type="checkbox"
                    checked={Boolean(editForm.agotado)}
                    onChange={(e) => handleEditChange('agotado', e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: '#81945b' }}
                  />
                  <label
                    htmlFor="edit-agotado"
                    style={{
                      fontSize: '13px',
                      color: '#4a3322',
                      cursor: 'pointer',
                      margin: 0,
                    }}
                  >
                    Agotado / No disponible
                  </label>
                </div>

                {error && (
                  <p
                    role="alert"
                    style={{ color: '#a33a2b', fontSize: '13px', margin: '0 0 10px' }}
                  >
                    {error}
                  </p>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    marginTop: '6px',
                  }}
                >
                  <button
                    type="button"
                    onClick={closeEdit}
                    disabled={saving}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      border: '1px solid #ddd1bd',
                      background: '#fff',
                      color: '#4a3322',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#81945b',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
