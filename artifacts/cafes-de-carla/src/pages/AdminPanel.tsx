import { useState } from 'react';
import { Button } from '@/components/ui/button';

type ProductoAdmin = {
  id: string;
  nombre: string;
  categoria?: string;
  agotado: boolean;
  precio?: number;
};

export function AdminPanel() {
  const [productos, setProductos] = useState<ProductoAdmin[]>([]);
  const [cargando, setCargando] = useState(false);
  const [actualizando, setActualizando] = useState<string | null>(null);

  // Productos de ejemplo (en producción vendrían de la base de datos)
  const PRODUCTOS_INICIALES: ProductoAdmin[] = [
    { id: 'calabacin-gouda-huevo', nombre: 'Calabacín, queso gouda, huevo y salsa sueca', categoria: 'Featured', agotado: false, precio: 330 },
    { id: 'moni-featured', nombre: 'Moni', categoria: 'Featured', agotado: false, precio: 440 },
    { id: 'vegetal-featured', nombre: 'Vegetal', categoria: 'Featured', agotado: false, precio: 400 },
    { id: 'bocadillo-moni', nombre: 'Moni (Bocadillo)', categoria: 'Bocadillos', agotado: false, precio: 440 },
    { id: 'bocadillo-esther', nombre: 'Esther', categoria: 'Bocadillos', agotado: false, precio: 440 },
    { id: 'bocadillo-fiona', nombre: 'Fiona', categoria: 'Bocadillos', agotado: false, precio: 440 },
    { id: 'bocadillo-carol', nombre: 'Carol', categoria: 'Bocadillos', agotado: false, precio: 440 },
    { id: 'bocadillo-carla', nombre: 'Carla', categoria: 'Bocadillos', agotado: false, precio: 430 },
    { id: 'bocadillo-rebeca', nombre: 'Rebeca', categoria: 'Bocadillos', agotado: false, precio: 440 },
    { id: 'sandwich-jamon-queso', nombre: 'Jamón y queso', categoria: 'Sandwiches', agotado: false, precio: 280 },
    { id: 'sandwich-vegetal', nombre: 'Vegetal', categoria: 'Sandwiches', agotado: false, precio: 320 },
    { id: 'croissant-jamon-queso', nombre: 'Jamón y queso', categoria: 'Croissants', agotado: false, precio: 300 },
    { id: 'croissant-especiales', nombre: 'Especiales', categoria: 'Croissants', agotado: false, precio: 450 },
    { id: 'tortitas', nombre: 'Tortitas', categoria: 'Gofres y Tortitas', agotado: false, precio: 600 },
    { id: 'cafe-expreso', nombre: 'Expreso', categoria: 'Cafés', agotado: false, precio: 125 },
    { id: 'cafe-con-leche', nombre: 'Café con leche', categoria: 'Cafés', agotado: false, precio: 200 },
  ];

  // Inicializar productos
  useState(() => {
    setProductos(PRODUCTOS_INICIALES);
  });

  const toggleAgotado = async (id: string, agotadoActual: boolean) => {
    const nuevoEstado = !agotadoActual;
    setActualizando(id);

    try {
      const response = await fetch('/api/update-producto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, agotado: nuevoEstado }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar estado');
      }

      // Actualizar estado local
      setProductos((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, agotado: nuevoEstado } : p
        )
      );

      alert(
        nuevoEstado
          ? 'Producto marcado como agotado'
          : 'Producto disponible nuevamente'
      );
    } catch (error: any) {
      alert(error.message || 'Error al actualizar estado');
      // Revertir estado local en caso de error
      setProductos((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, agotado: agotadoActual } : p
        )
      );
    } finally {
      setActualizando(null);
    }
  };

  return (
    <div className="admin-panel p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="serif text-3xl font-bold mb-2">Panel de Administración</h1>
        <p className="text-muted-foreground">
          Gestiona el estado de disponibilidad (agotado/disponible) de los productos en la base de datos Neon.
        </p>
      </div>

      <div className="space-y-4">
        {productos.map((producto) => (
          <div
            key={producto.id}
            className="admin-product p-4 border rounded-md flex items-center justify-between bg-card"
          >
            <div className="flex-1">
              <h3 className="font-medium text-foreground">{producto.nombre}</h3>
              <p className="text-xs text-muted-foreground">
                {producto.categoria} · {producto.precio ? (producto.precio / 100).toFixed(2) + ' €' : 'Precio N/D'} · ID: {producto.id}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  producto.agotado
                    ? 'bg-destructive/10 text-destructive border border-destructive/20'
                    : 'bg-success/10 text-success border border-success/20'
                }`}
              >
                {producto.agotado ? 'AGOTADO' : 'DISPONIBLE'}
              </span>

              <Button
                onClick={() => toggleAgotado(producto.id, producto.agotado)}
                variant={producto.agotado ? 'secondary' : 'destructive'}
                size="sm"
                disabled={actualizando === producto.id}
                className="w-32"
              >
                {actualizando === producto.id
                  ? 'Actualizando...'
                  : producto.agotado
                  ? 'Marcar Disponible'
                  : 'Marcar como Agotado'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {productos.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No hay productos disponibles.
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
