/**
 * Catálogo de productos y precios definidos en el servidor.
 * Los precios NO provienen del navegador: se resuelven aquí por ID de producto.
 * Los IDs coinciden con los utilizados en lib/artifacts/cafes-de-carla/src/data/menu.ts.
 *
 * Para modo producción, reemplaza unit_amount por Price IDs de Stripe
 * (price: 'price_...') si prefieres usar precios gestionados en Stripe Dashboard.
 */
export type CatalogItem = {
  name: string;
  priceCents: number;
  currency: 'eur';
  description?: string;
};

export const CATALOG: Record<string, CatalogItem> = {
  // --- Cafés clásicos (solo los que tienen precio indicado en la carta) ---
  'cafe-carla': {
    name: 'Café Carla',
    priceCents: 0,
    description: 'Baileys o Tía María.',
  },
  // Sin precio definido en la carta -> no vendible por checkout hasta que se asigne precio.

  // --- Bocadillos ---
  'moni': { name: 'Moni', priceCents: 220, description: 'Pollo al curry, aguacate, queso tierno, pavo y tomate.' },
  'esther': { name: 'Esther', priceCents: 220, description: 'Pata, cebolla crujiente, queso tierno y salsa sueca.' },
  'fiona': { name: 'Fiona', priceCents: 220, description: 'Serrano, majorero a la plancha, tomate y aguacate.' },
  'carol': { name: 'Carol', priceCents: 220, description: 'Pavo, aguacate, tortilla francesa y queso majorero.' },
  'carla': { name: 'Carla', priceCents: 220, description: 'Masa de pollo, aguacate y queso.' },
  'rebeca': { name: 'Rebeca', priceCents: 210, description: 'Pollo, pimiento verde, cebolla y salsa sueca.' },
  'serrano-queso-tierno': { name: 'Jamón serrano y queso tierno', priceCents: 200 },
  'serrano-catalana': { name: 'Jamón serrano catalana', priceCents: 200 },
  'iberico-queso-tierno': { name: 'Jamón ibérico y queso tierno', priceCents: 300 },
  'iberico-catalana': { name: 'Jamón ibérico catalana', priceCents: 295 },
  'tortilla-pimientos': { name: 'Tortilla y pimientos verdes', priceCents: 220 },
  'pollo-curry': { name: 'Pollo al curry', priceCents: 220, description: 'Mayonesa, lechuga y tomate.' },
  'carne-mechada': { name: 'Carne mechada', priceCents: 220, description: 'Queso gouda y salsa sueca.' },
  'lomo-especial': { name: 'Lomo especial', priceCents: 220, description: 'Lomo adobado, lechuga, tomate y zanahoria.' },
  'pata-tomate': { name: 'Pata y tomate', priceCents: 220 },
  'queso-tierno-ensalada': { name: 'Queso tierno', priceCents: 220, description: 'Aceite, lechuga, tomate y orégano.' },
  'queso-calabacin-miel': { name: 'Queso tierno, calabacín y miel', priceCents: 220 },
  'vegetal-bocadillo': { name: 'Vegetal', priceCents: 220, description: 'Lechuga, tomate, millo, atún, zanahoria y mayonesa.' },

  // --- Sandwiches ---
  'sandwich-calabacin-gouda': { name: 'Calabacín, queso gouda, huevo y salsa sueca', priceCents: 150 },
  'sandwich-cangrejo-berros-zanahoria': { name: 'Cangrejos, berros y zanahoria', priceCents: 125 },
  'sandwich-pollo-huevo': { name: 'Pollo y huevo', priceCents: 135 },
  'sandwich-pollo-huevo-gouda': { name: 'Pollo, huevo y queso gouda', priceCents: 150 },
  'sandwich-atun-huevo-gouda': { name: 'Atún, huevo y queso gouda', priceCents: 150 },
  'sandwich-atun-huevo-aguacate': { name: 'Atún, huevo y aguacate', priceCents: 150 },
  'sandwich-atun-millo': { name: 'Atún y millo', priceCents: 125 },
  'sandwich-atun-pimiento': { name: 'Atún y pimiento', priceCents: 125 },
  'sandwich-cangrejo': { name: 'Cangrejo', priceCents: 125 },
  'sandwich-berros-queso': { name: 'Berros y queso tierno', priceCents: 150 },
  'sandwich-jamon-queso': { name: 'Jamón y queso', priceCents: 250 },
  'sandwich-vegetal': { name: 'Vegetal', priceCents: 300 },
  'sandwich-calabacin-queso': { name: 'Calabacín y queso tierno', priceCents: 150 },
  'sandwich-especiales': { name: 'Especiales', priceCents: 350 },

  // --- Croissants ---
  'croissant-vegetal': { name: 'Vegetal', priceCents: 200 },
  'croissant-jamon-queso': { name: 'Jamón y queso', priceCents: 300 },
  'croissant-atun-millo': { name: 'Atún y millo', priceCents: 300 },
  'croissant-tortilla': { name: 'Tortilla', priceCents: 300 },
  'croissant-especiales': { name: 'Especiales', priceCents: 450 },

  // --- Dulces ---
  'tartas-variadas': { name: 'Tartas variadas', priceCents: 400 },
  'queque-casero': { name: 'Queque casero', priceCents: 250 },
  'cookies-chocolate': { name: 'Cookies con chocolate', priceCents: 220 },

  // --- Crepes salados ---
  'crepe-mixto': { name: 'Mixto', priceCents: 520, description: 'Jamón y queso.' },
  'crepe-pizza': { name: 'Crep pizza', priceCents: 520, description: 'Mozzarella, atún, salsa de tomate, orégano y albahaca.' },

  // --- Crepes dulces ---
  'crepe-cacahuete-chocolate': { name: 'Crep de crema de cacahuete y chocolate', priceCents: 520 },
  'crepe-caramelo': { name: 'Crep de caramelo', priceCents: 520 },
  'crepe-dulce-leche': { name: 'Crep de dulce de leche', priceCents: 520 },
  'crepe-chocomix': { name: 'Crep Chocomix', priceCents: 520, description: 'Chocolate y chocolate blanco.' },
  'crepe-oreo': { name: 'Crep Oreo', priceCents: 520, description: 'Chocolate blanco y galletas Oreo.' },
  'crepe-lotus': { name: 'Crep Lotus', priceCents: 520, description: 'Crema de Lotus y galletas Lotus.' },

  // --- Cereales y boles ---
  'cereales': { name: 'Cereales', priceCents: 300, description: 'Tamaños S, M y L. Leche entera, desnatada, sin lactosa, avena, soja o almendra.' },

  // --- Gofres y tortitas ---
  'gofres': { name: 'Gofres', priceCents: 390, description: 'Elige topping: caramelo, chocolate, crema de cacahuete, chocolate blanco, crema Lotus, mermelada o galletas Lotus.' },
  'tortitas': { name: 'Tortitas', priceCents: 290 },

  // --- Extras ---
  'extras-salados': { name: 'Extras', priceCents: 100, description: 'Lomo, pata, pollo, serrano, atún, queso majorero, queso tierno, ibérico, entre otros.' },
  'suplementos': { name: 'Suplementos', priceCents: 50, description: 'Jamón, queso, entre otros.' },
  'suplemento-helado': { name: 'Suplemento de bola de helado', priceCents: 100 },
};

export function getCatalogItem(itemId: string): CatalogItem | undefined {
  return CATALOG[itemId];
}

export function isSellable(itemId: string): boolean {
  const item = CATALOG[itemId];
  return Boolean(item && item.priceCents > 0);
}
