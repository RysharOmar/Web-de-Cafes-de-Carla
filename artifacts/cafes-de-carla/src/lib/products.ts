/**
 * Tipos y utilidades para transformar los productos que vienen de Neon
 * (`/api/products`) en la estructura que usa la carta y el carrito.
 */

export type ApiProducto = {
  id: number;
  nombre: string;
  precio: number; // euros (columna NUMERIC(10,2))
  precioCents: number; // precio Normal en céntimos
  precio_mini: number | null; // euros
  precioMiniCents: number | null;
  precio_grande: number | null; // euros
  precioGrandeCents: number | null;
  categoria: string;
  agotado: boolean;
  imagen_url: string | null;
  descripcion: string | null;
};

export type SizeOption = {
  label: 'Mini' | 'Normal' | 'Grande';
  priceCents: number;
};

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  sizes: SizeOption[];
  defaultSize: string;
  variants?: string[];
  defaultVariant?: string;
  agotado: boolean;
  imageUrl: string | null;
};

export type MenuCategory = {
  id: string;
  title: string;
  note: string;
  image: string | null;
  alt: string;
  items: MenuItem[];
};

const DEFAULT_CATEGORY = 'Otros';

function slugify(value: string): string {
  const slug = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'otros';
}

/** Convierte una fila de la API en un producto de la carta. */
export function productToMenuItem(producto: ApiProducto): MenuItem {
  const sizes: SizeOption[] = [];

  if (producto.precioMiniCents != null && producto.precioMiniCents > 0) {
    sizes.push({ label: 'Mini', priceCents: producto.precioMiniCents });
  }

  if (producto.precioCents > 0) {
    sizes.push({ label: 'Normal', priceCents: producto.precioCents });
  }

  if (producto.precioGrandeCents != null && producto.precioGrandeCents > 0) {
    sizes.push({ label: 'Grande', priceCents: producto.precioGrandeCents });
  }

  return {
    id: String(producto.id),
    name: producto.nombre,
    description: producto.descripcion?.trim() || undefined,
    sizes,
    defaultSize: sizes.some((size) => size.label === 'Normal')
      ? 'Normal'
      : (sizes[0]?.label ?? 'Normal'),
    agotado: Boolean(producto.agotado),
    imageUrl: producto.imagen_url?.trim() || null,
  };
}

/**
 * Agrupa los productos por `categoria`.
 * Las categorías sin productos válidos no se incluyen.
 */
export function groupProductos(productos: ApiProducto[]): MenuCategory[] {
  const categories = new Map<string, MenuCategory>();

  for (const producto of productos) {
    const title = producto.categoria?.trim() || DEFAULT_CATEGORY;
    const item = productToMenuItem(producto);

    // Un producto sin ningún precio válido no se puede pedir.
    if (item.sizes.length === 0) continue;

    const id = slugify(title);
    let category = categories.get(id);

    if (!category) {
      category = {
        id,
        title,
        note: '',
        image: null,
        alt: '',
        items: [],
      };
      categories.set(id, category);
    }

    category.items.push(item);
  }

  return Array.from(categories.values()).sort((a, b) =>
    a.title.localeCompare(b.title, 'es'),
  );
}

/** Precio en céntimos para el tamaño elegido de una línea del carrito. */
export function priceForLine(
  item: MenuItem | undefined,
  sizeLabel: string,
): number {
  if (!item) return 0;
  const size = item.sizes.find((option) => option.label === sizeLabel);
  return size?.priceCents ?? item.sizes[0]?.priceCents ?? 0;
}
