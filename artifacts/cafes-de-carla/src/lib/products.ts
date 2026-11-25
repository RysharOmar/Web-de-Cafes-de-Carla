/**
 * Tipos y utilidades para transformar los productos que vienen de Neon
 * (`/api/products`) en la estructura que usa la carta y el carrito.
 */

export type ApiProducto = {
  id: number;
  nombre: string;
  nombre_en: string | null;
  precio: number; // euros (columna NUMERIC(10,2))
  precioCents: number; // precio Normal en céntimos
  precio_mini: number | null; // euros
  precioMiniCents: number | null;
  precio_grande: number | null; // euros
  precioGrandeCents: number | null;
  categoria: string;
  categoria_en: string | null;
  agotado: boolean;
  imagen_url: string | null;
  descripcion: string | null;
  descripcion_en: string | null;
};

export type SizeOption = {
  label: 'Mini' | 'Normal' | 'Grande';
  priceCents: number;
};

export type MenuItem = {
  id: string;
  name: string;
  // Nombre base en español (usado internamente: cocina, Stripe, carrito).
  nameEs: string;
  description?: string;
  category: string;
  // Categoría base en español (fallback para agrupación).
  categoryEs: string;
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

import type { Lang } from '@/context/LanguageContext';

const DEFAULT_CATEGORY = 'Otros';
const CEREALES_CATEGORY = 'cereales';
const CEREAL_SIZE_LABELS: Record<string, string> = {
  Mini: 'S',
  Normal: 'M',
  Grande: 'L',
};

function normalizeCategory(value: string): string {
  return value.trim().toLocaleLowerCase('es');
}

/**
 * Etiqueta visible para una talla. En Cereales las columnas Mini/Normal/Grande
 * representan S/M/L; el resto de categorías conserva sus nombres.
 * En EN, Normal/Grande se muestran como Regular/Large.
 */
export function displaySizeLabel(
  categoria: string,
  sizeLabel: string,
  lang: Lang = 'es',
): string {
  if (normalizeCategory(categoria) === CEREALES_CATEGORY) {
    return CEREAL_SIZE_LABELS[sizeLabel] ?? sizeLabel;
  }
  if (lang === 'en') {
    if (sizeLabel === 'Normal') return 'Regular';
    if (sizeLabel === 'Grande') return 'Large';
  }
  return sizeLabel;
}

function slugify(value: string): string {
  const slug = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'otros';
}

/** Convierte una fila de la API en un producto de la carta, en el idioma activo. */
export function productToMenuItem(
  producto: ApiProducto,
  lang: Lang = 'es',
): MenuItem {
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

  const nombre = producto[lang === 'en' ? 'nombre_en' : 'nombre'];
  const descripcion =
    lang === 'en' ? producto.descripcion_en : producto.descripcion;
  const categoria =
    lang === 'en' ? producto.categoria_en : producto.categoria;

  return {
    id: String(producto.id),
    name: (nombre?.trim() ?? producto.nombre?.trim()) || '',
    nameEs: producto.nombre?.trim() ?? '',
    description: descripcion?.trim() || undefined,
    category: (categoria?.trim() ?? producto.categoria?.trim()) || DEFAULT_CATEGORY,
    categoryEs: producto.categoria?.trim() ?? DEFAULT_CATEGORY,
    sizes,
    defaultSize: sizes.some((size) => size.label === 'Normal')
      ? 'Normal'
      : (sizes[0]?.label ?? 'Normal'),
    agotado: Boolean(producto.agotado),
    imageUrl: producto.imagen_url?.trim() || null,
  };
}

/**
 * Agrupa los productos por `categoria` (en el idioma activo, con fallback al español).
 * Las categorías sin productos válidos no se incluyen.
 */
export function groupProductos(
  productos: ApiProducto[],
  lang: Lang = 'es',
): MenuCategory[] {
  const categories = new Map<string, MenuCategory>();

  for (const producto of productos) {
    const item = productToMenuItem(producto, lang);
    const title = item.category || DEFAULT_CATEGORY;

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
    a.title.localeCompare(b.title, lang === 'en' ? 'en' : 'es'),
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
