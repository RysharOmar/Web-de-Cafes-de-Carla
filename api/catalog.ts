/**
 * Catálogo de productos y precios definidos en el servidor.
 * Los precios NO provienen del navegador: se resuelven aquí por ID de producto.
 * sizePrices: precios por tamaño (Mini/Normal, Medio/Normal, S/M/L, Unidad).
 *
 * Para modo producción, reemplaza unit_amount por Price IDs de Stripe
 * (price: 'price_...') si prefieres usar precios gestionados en Stripe Dashboard.
 */
export type CatalogItem = {
  name: string;
  priceCents: number;          // precio por defecto (tamaño normal/único)
  sizePrices?: Record<string, number>; // precios por etiqueta de tamaño
  defaultSize?: string;
  currency: 'eur';
  description?: string;
};

export const CATALOG: Record<string, CatalogItem> = {
  // --- Featured ---
  'calabacin-gouda-huevo': { name: 'Calabacín, queso gouda, huevo y salsa sueca', currency: 'eur',
    priceCents: 330, sizePrices: { Mini: 170, Normal: 330 }, defaultSize: 'Normal' },
  'moni-featured': { name: 'Moni', currency: 'eur',
    priceCents: 440, sizePrices: { Mini: 285, Normal: 440 }, defaultSize: 'Normal',
    description: 'Pollo al curry, crema de aguacate, queso tierno, pavo y tomate.' },
  'vegetal-featured': { name: 'Vegetal', currency: 'eur',
    priceCents: 400, sizePrices: { Mini: 230, Normal: 400 }, defaultSize: 'Normal',
    description: 'Lechuga, tomate, millo, atún, zanahoria y mayonesa.' },

  // --- Bocadillos ---
  'bocadillo-moni': { name: 'Moni', currency: 'eur',
    priceCents: 440, sizePrices: { Mini: 285, Normal: 440 }, defaultSize: 'Normal',
    description: 'Pollo al curry, crema de aguacate, queso tierno, pavo y tomate.' },
  'bocadillo-esther': { name: 'Esther', currency: 'eur',
    priceCents: 440, sizePrices: { Mini: 285, Normal: 440 }, defaultSize: 'Normal',
    description: 'Pata, cebolla crujiente, queso tierno y salsa sueca.' },
  'bocadillo-fiona': { name: 'Fiona', currency: 'eur',
    priceCents: 440, sizePrices: { Mini: 285, Normal: 440 }, defaultSize: 'Normal',
    description: 'Serrano, majoreno a la plancha, tomate y crema de aguacate.' },
  'bocadillo-carol': { name: 'Carol', currency: 'eur',
    priceCents: 440, sizePrices: { Mini: 285, Normal: 440 }, defaultSize: 'Normal',
    description: 'Pavo, crema de aguacate, tortilla francesa, y queso majoreno.' },
  'bocadillo-carla': { name: 'Carla', currency: 'eur',
    priceCents: 430, sizePrices: { Mini: 260, Normal: 430 }, defaultSize: 'Normal',
    description: 'Masa de pollo, crema de aguacate y queso.' },
  'bocadillo-rebeca': { name: 'Rebeca', currency: 'eur',
    priceCents: 440, sizePrices: { Mini: 285, Normal: 440 }, defaultSize: 'Normal',
    description: 'Pollo, pimiento verde, cebolla y salsa sueca.' },
  'bocadillo-jamon-serrano-queso-tierno': { name: 'Jamón serrano y queso tierno', currency: 'eur',
    priceCents: 400, sizePrices: { Mini: 230, Normal: 400 }, defaultSize: 'Normal' },
  'bocadillo-jamon-serrano-catalana': { name: 'Jamón serrano catalana', currency: 'eur',
    priceCents: 400, sizePrices: { Mini: 230, Normal: 400 }, defaultSize: 'Normal' },
  'bocadillo-jamon-iberico-queso-tierno': { name: 'Jamón ibérico y queso tierno', currency: 'eur',
    priceCents: 500, sizePrices: { Mini: 280, Normal: 500 }, defaultSize: 'Normal' },
  'bocadillo-jamon-iberico-catalana': { name: 'Jamón ibérico catalana', currency: 'eur',
    priceCents: 460, sizePrices: { Mini: 260, Normal: 460 }, defaultSize: 'Normal' },
  'bocadillo-tortilla-pimientos': { name: 'Tortilla y pimientos verdes', currency: 'eur',
    priceCents: 400, sizePrices: { Mini: 230, Normal: 400 }, defaultSize: 'Normal' },
  'bocadillo-pollo-curry': { name: 'Pollo al curry', currency: 'eur',
    priceCents: 400, sizePrices: { Mini: 230, Normal: 400 }, defaultSize: 'Normal',
    description: 'Pollo al curry, mayonesa, lechuga y tomate.' },
  'bocadillo-carne-mechada': { name: 'Carne mechada', currency: 'eur',
    priceCents: 400, sizePrices: { Mini: 230, Normal: 400 }, defaultSize: 'Normal',
    description: 'Carne mechada, queso gouda y salsa sueca.' },
  'bocadillo-lomo-especial': { name: 'Lomo especial', currency: 'eur',
    priceCents: 400, sizePrices: { Mini: 230, Normal: 400 }, defaultSize: 'Normal',
    description: 'Lomo adobado, lechuga, tomate y zanahoria.' },
  'bocadillo-pata-tomate': { name: 'Pata y tomate', currency: 'eur',
    priceCents: 400, sizePrices: { Mini: 230, Normal: 400 }, defaultSize: 'Normal' },
  'bocadillo-queso-tierno': { name: 'Queso tierno', currency: 'eur',
    priceCents: 400, sizePrices: { Mini: 230, Normal: 400 }, defaultSize: 'Normal',
    description: 'Queso tierno, aceite, lechuga, tomate y orégano.' },
  'bocadillo-queso-calabacin-miel': { name: 'Queso tierno, calabacín y miel', currency: 'eur',
    priceCents: 400, sizePrices: { Mini: 230, Normal: 400 }, defaultSize: 'Normal' },
  'bocadillo-vegetal': { name: 'Vegetal', currency: 'eur',
    priceCents: 400, sizePrices: { Mini: 230, Normal: 400 }, defaultSize: 'Normal',
    description: 'Lechuga, tomate, millo, atún, zanahoria y mayonesa.' },

  // --- Extras y Suplementos ---
  'extra-extras': { name: 'Extras', currency: 'eur',
    priceCents: 100, sizePrices: { Unidad: 100 }, defaultSize: 'Unidad',
    description: 'Lomo, pata, pollo, serrano, atún, queso majoreno, queso tierno, ibérico, crema de aguacate, etc.' },
  'extra-suplementos': { name: 'Suplementos', currency: 'eur',
    priceCents: 50, sizePrices: { Unidad: 50 }, defaultSize: 'Unidad',
    description: 'Jamón, queso, etc.' },

  // --- Sandwiches ---
  'sandwich-calabacin-gouda-huevo': { name: 'Calabacín, queso gouda, huevo y salsa sueca', currency: 'eur',
    priceCents: 330, sizePrices: { Medio: 170, Normal: 330 }, defaultSize: 'Normal' },
  'sandwich-cangrejo-berros-zanahoria': { name: 'Cangrejos, berros y zanahoria', currency: 'eur',
    priceCents: 300, sizePrices: { Medio: 150, Normal: 300 }, defaultSize: 'Normal' },
  'sandwich-pollo-huevo': { name: 'Pollo y huevo', currency: 'eur',
    priceCents: 300, sizePrices: { Medio: 150, Normal: 300 }, defaultSize: 'Normal' },
  'sandwich-pollo-huevo-gouda': { name: 'Pollo, huevo y queso gouda', currency: 'eur',
    priceCents: 330, sizePrices: { Medio: 170, Normal: 330 }, defaultSize: 'Normal' },
  'sandwich-atun-huevo-gouda': { name: 'Atún, huevo y queso gouda', currency: 'eur',
    priceCents: 300, sizePrices: { Medio: 150, Normal: 300 }, defaultSize: 'Normal' },
  'sandwich-atun-huevo-aguacate': { name: 'Atún, huevo y crema de aguacate', currency: 'eur',
    priceCents: 330, sizePrices: { Medio: 170, Normal: 330 }, defaultSize: 'Normal' },
  'sandwich-atun-millo': { name: 'Atún y millo', currency: 'eur',
    priceCents: 280, sizePrices: { Medio: 150, Normal: 280 }, defaultSize: 'Normal' },
  'sandwich-atun-pimiento': { name: 'Atún y pimiento', currency: 'eur',
    priceCents: 280, sizePrices: { Medio: 150, Normal: 280 }, defaultSize: 'Normal' },
  'sandwich-cangrejo': { name: 'Cangrejo', currency: 'eur',
    priceCents: 280, sizePrices: { Medio: 150, Normal: 280 }, defaultSize: 'Normal' },
  'sandwich-berros-queso': { name: 'Berros y queso tierno', currency: 'eur',
    priceCents: 320, sizePrices: { Medio: 170, Normal: 320 }, defaultSize: 'Normal' },
  'sandwich-jamon-queso': { name: 'Jamón y queso', currency: 'eur',
    priceCents: 280, sizePrices: { Normal: 280 }, defaultSize: 'Normal' },
  'sandwich-vegetal': { name: 'Vegetal', currency: 'eur',
    priceCents: 320, sizePrices: { Normal: 320 }, defaultSize: 'Normal' },
  'sandwich-calabacin-queso': { name: 'Calabacín y queso tierno', currency: 'eur',
    priceCents: 300, sizePrices: { Medio: 150, Normal: 300 }, defaultSize: 'Normal' },
  'sandwich-especiales': { name: 'Especiales', currency: 'eur',
    priceCents: 350, sizePrices: { Normal: 350 }, defaultSize: 'Normal' },

  // --- Croissants ---
  'croissant-vegetal': { name: 'Vegetal', currency: 'eur',
    priceCents: 400, sizePrices: { Unidad: 400 }, defaultSize: 'Unidad' },
  'croissant-jamon-queso': { name: 'Jamón y queso', currency: 'eur',
    priceCents: 300, sizePrices: { Unidad: 300 }, defaultSize: 'Unidad' },
  'croissant-atun-millo': { name: 'Atún y millo', currency: 'eur',
    priceCents: 300, sizePrices: { Unidad: 300 }, defaultSize: 'Unidad' },
  'croissant-tortilla': { name: 'Tortilla', currency: 'eur',
    priceCents: 300, sizePrices: { Unidad: 300 }, defaultSize: 'Unidad' },
  'croissant-especiales': { name: 'Especiales', currency: 'eur',
    priceCents: 450, sizePrices: { Unidad: 450 }, defaultSize: 'Unidad' },

  // --- Gofres y Tortitas ---
  'tortitas': { name: 'Tortitas', currency: 'eur',
    priceCents: 600, sizePrices: { Unidad: 600 }, defaultSize: 'Unidad',
    description: 'Topping: salsa de caramelo, chocolate, crema de Lotus, crema de cacahuete, chocolate blanco, mermelada, galleta Lotus, pistacho.' },

  // --- Crepes ---
  'crepe-mixto': { name: 'Mixto', currency: 'eur',
    priceCents: 600, sizePrices: { Unidad: 600 }, defaultSize: 'Unidad', description: 'Jamón y queso.' },
  'crepe-pizza': { name: 'Pizza', currency: 'eur',
    priceCents: 600, sizePrices: { Unidad: 600 }, defaultSize: 'Unidad',
    description: 'Mozzarella, atún, salsa de tomate, orégano y albahaca.' },
  'crepe-cacahuete-chocolate': { name: 'Crepe de crema de cacahuete y chocolate', currency: 'eur',
    priceCents: 600, sizePrices: { Unidad: 600 }, defaultSize: 'Unidad' },
  'crepe-caramelo': { name: 'Crepe de caramelo', currency: 'eur',
    priceCents: 600, sizePrices: { Unidad: 600 }, defaultSize: 'Unidad' },
  'crepe-dulce-leche': { name: 'Crepe de dulce de leche', currency: 'eur',
    priceCents: 600, sizePrices: { Unidad: 600 }, defaultSize: 'Unidad' },
  'crepe-chocomix': { name: 'Crepe Chocomix', currency: 'eur',
    priceCents: 600, sizePrices: { Unidad: 600 }, defaultSize: 'Unidad',
    description: 'Chocolate y chocolate blanco.' },
  'crepe-oreo': { name: 'Crepe Oreo', currency: 'eur',
    priceCents: 600, sizePrices: { Unidad: 600 }, defaultSize: 'Unidad',
    description: 'Chocolate blanco y galletas Oreo.' },
  'crepe-lotus': { name: 'Crepe Lotus', currency: 'eur',
    priceCents: 600, sizePrices: { Unidad: 600 }, defaultSize: 'Unidad',
    description: 'Crema de Lotus y galletas Lotus.' },

  // --- Dulces ---
  'dulce-tartas-variadas': { name: 'Tartas variadas', currency: 'eur',
    priceCents: 400, sizePrices: { Unidad: 400 }, defaultSize: 'Unidad' },
  'dulce-queso-casero': { name: 'Queso casero', currency: 'eur',
    priceCents: 250, sizePrices: { Unidad: 250 }, defaultSize: 'Unidad' },
  'dulce-cookies': { name: 'Variedad de Cookies', currency: 'eur',
    priceCents: 240, sizePrices: { Unidad: 240 }, defaultSize: 'Unidad' },

  // --- Suplementos dulces ---
  'suplemento-helado': { name: 'Bola de helado', currency: 'eur',
    priceCents: 100, sizePrices: { Unidad: 100 }, defaultSize: 'Unidad' },
  'suplemento-nata': { name: 'Nata', currency: 'eur',
    priceCents: 50, sizePrices: { Unidad: 50 }, defaultSize: 'Unidad' },

  // --- Cereales ---
  'cereales': { name: 'Cereales', currency: 'eur',
    priceCents: 400, sizePrices: { S: 300, M: 360, L: 400 }, defaultSize: 'L',
    description: 'Tamaños S, M y L. Leche entera, desnatada, sin lactosa, avena, soja o almendra.' },

  // --- Cafés ---
  'cafe-biberon': { name: 'Biberón', currency: 'eur',
    priceCents: 150, sizePrices: { Unidad: 150 }, defaultSize: 'Unidad' },
  'cafe-biberon-largo': { name: 'Biberón largo', currency: 'eur',
    priceCents: 190, sizePrices: { Unidad: 190 }, defaultSize: 'Unidad' },
  'cafe-expreso': { name: 'Expreso', currency: 'eur',
    priceCents: 125, sizePrices: { Unidad: 125 }, defaultSize: 'Unidad' },
  'cafe-expreso-doble': { name: 'Expreso doble', currency: 'eur',
    priceCents: 175, sizePrices: { Unidad: 175 }, defaultSize: 'Unidad' },
  'cafe-c-doble': { name: 'C. doble', currency: 'eur',
    priceCents: 225, sizePrices: { Unidad: 225 }, defaultSize: 'Unidad' },
  'cafe-americano': { name: 'Americano', currency: 'eur',
    priceCents: 180, sizePrices: { Unidad: 180 }, defaultSize: 'Unidad' },
  'cafe-hielo': { name: 'Café hielo', currency: 'eur',
    priceCents: 210, sizePrices: { Unidad: 210 }, defaultSize: 'Unidad' },
  'cafe-cortado': { name: 'Cortado', currency: 'eur',
    priceCents: 140, sizePrices: { Unidad: 140 }, defaultSize: 'Unidad' },
  'cafe-cortado-largo': { name: 'Cortado largo', currency: 'eur',
    priceCents: 180, sizePrices: { Unidad: 180 }, defaultSize: 'Unidad' },
  'cafe-capuchino': { name: 'Capuchino', currency: 'eur',
    priceCents: 250, sizePrices: { Unidad: 250 }, defaultSize: 'Unidad' },
  'cafe-con-leche': { name: 'Café con leche', currency: 'eur',
    priceCents: 200, sizePrices: { Unidad: 200 }, defaultSize: 'Unidad' },
  'cafe-leche-leche-corto': { name: 'Leche y leche corto', currency: 'eur',
    priceCents: 150, sizePrices: { Unidad: 150 }, defaultSize: 'Unidad' },
  'cafe-leche-leche-largo': { name: 'Leche y leche largo', currency: 'eur',
    priceCents: 190, sizePrices: { Unidad: 190 }, defaultSize: 'Unidad' },
  'cafe-con-leche-tanque': { name: 'Café con leche tanque', currency: 'eur',
    priceCents: 270, sizePrices: { Unidad: 270 }, defaultSize: 'Unidad' },
  'cafe-capuchino-tanque': { name: 'Capuchino tanque', currency: 'eur',
    priceCents: 280, sizePrices: { Unidad: 280 }, defaultSize: 'Unidad' },
  'cafe-leche-leche-tanque': { name: 'Leche y leche tanque', currency: 'eur',
    priceCents: 280, sizePrices: { Unidad: 280 }, defaultSize: 'Unidad' },
  'cafe-colacao': { name: 'ColaCao', currency: 'eur',
    priceCents: 230, sizePrices: { Unidad: 230 }, defaultSize: 'Unidad' },
  'cafe-colacao-tanque': { name: 'ColaCao tanque', currency: 'eur',
    priceCents: 250, sizePrices: { Unidad: 250 }, defaultSize: 'Unidad' },
  'cafe-vaso-leche': { name: 'Vaso de leche', currency: 'eur',
    priceCents: 120, sizePrices: { Unidad: 120 }, defaultSize: 'Unidad' },
  'cafe-chocolate-taza': { name: 'Chocolate a la taza', currency: 'eur',
    priceCents: 250, sizePrices: { Unidad: 250 }, defaultSize: 'Unidad' },

  // --- Infusiones ---
  'infusion-manzanilla': { name: 'Manzanilla', currency: 'eur',
    priceCents: 200, sizePrices: { Unidad: 200 }, defaultSize: 'Unidad' },
  'infusion-menta-poleo': { name: 'Menta Poleo', currency: 'eur',
    priceCents: 200, sizePrices: { Unidad: 200 }, defaultSize: 'Unidad' },
  'infusion-frutos-bosque': { name: 'Frutos del bosque', currency: 'eur',
    priceCents: 250, sizePrices: { Unidad: 250 }, defaultSize: 'Unidad' },
  'infusion-te-verde-rojo-negro': { name: 'Té verde, rojo, negro', currency: 'eur',
    priceCents: 230, sizePrices: { Unidad: 230 }, defaultSize: 'Unidad' },
  'infusion-te-americano': { name: 'Té americano', currency: 'eur',
    priceCents: 260, sizePrices: { Unidad: 260 }, defaultSize: 'Unidad' },
  'infusion-te-matcha': { name: 'Té matcha', currency: 'eur',
    priceCents: 400, sizePrices: { Unidad: 400 }, defaultSize: 'Unidad' },

  // --- Cafés Especiales ---
  'especial-lotus': { name: 'Lotus', currency: 'eur',
    priceCents: 450, sizePrices: { Unidad: 450 }, defaultSize: 'Unidad',
    description: 'Café, crema de leche, crema lotus, galletas lotus.' },
  'especial-barraquito': { name: 'Barraquito', currency: 'eur',
    priceCents: 450, sizePrices: { Unidad: 450 }, defaultSize: 'Unidad',
    description: 'Café, condensada, licor 43, crema de leche, canela, limón.' },
  'especial-cafe-carla': { name: 'Café Carla', currency: 'eur',
    priceCents: 450, sizePrices: { Unidad: 450 }, defaultSize: 'Unidad',
    description: 'Café, condensada, bayleis, crema de leche.' },
  'especial-moka': { name: 'Moka', currency: 'eur',
    priceCents: 450, sizePrices: { Unidad: 450 }, defaultSize: 'Unidad',
    description: 'Café, chocolate, nata.' },
  'especial-cafe-titi': { name: 'Café Titi', currency: 'eur',
    priceCents: 450, sizePrices: { Unidad: 450 }, defaultSize: 'Unidad',
    description: 'Café, tía María, crema de leche.' },
  'especial-cafe-caramel': { name: 'Café Caramel', currency: 'eur',
    priceCents: 450, sizePrices: { Unidad: 450 }, defaultSize: 'Unidad',
    description: 'Café, caramelo, crema de leche, nata.' },
  'especial-chocolate-suizo': { name: 'Chocolate Suizo', currency: 'eur',
    priceCents: 450, sizePrices: { Unidad: 450 }, defaultSize: 'Unidad' },

  // --- Suplementos cafés ---
  'suplemento-licores': { name: 'Licores', currency: 'eur',
    priceCents: 50, sizePrices: { Unidad: 50 }, defaultSize: 'Unidad',
    description: 'Licor Tía María, Licor 43, Baileys.' },
  'suplemento-nata-condensada-leche': { name: 'Nata, Condensada y Leche', currency: 'eur',
    priceCents: 30, sizePrices: { Unidad: 30 }, defaultSize: 'Unidad' },
  'suplemento-vegetal-sin-lactosa': { name: 'Bebidas vegetales y sin lactosa', currency: 'eur',
    priceCents: 20, sizePrices: { Unidad: 20 }, defaultSize: 'Unidad' },
  'suplemento-canela': { name: 'Canela', currency: 'eur',
    priceCents: 20, sizePrices: { Unidad: 20 }, defaultSize: 'Unidad' },
};

export function getCatalogItem(itemId: string): CatalogItem | undefined {
  return CATALOG[itemId];
}

export function isSellable(itemId: string): boolean {
  const item = CATALOG[itemId];
  return Boolean(item && item.priceCents > 0);
}

export function priceForSize(itemId: string, sizeLabel: string): number {
  const item = CATALOG[itemId];
  if (!item) return 0;
  if (item.sizePrices && item.sizePrices[sizeLabel] !== undefined) {
    return item.sizePrices[sizeLabel];
  }
  return item.priceCents;
}
