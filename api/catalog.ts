/**
 * Catálogo de productos y precios definidos en el servidor.
 * Los precios NO provienen del navegador: se resuelven aquí por ID de producto.
 * Usamos el precio "normal" (el más caro) para Stripe Checkout.
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
  // --- Featured ---
  'calabacin-gouda-huevo': { name: 'Calabacín, queso gouda, huevo y salsa sueca', currency: 'eur',
    priceCents: 330 },
  'moni-featured': { name: 'Moni', currency: 'eur',
    priceCents: 440, description: 'Pollo al curry, crema de aguacate, queso tierno, pavo y tomate.' },
  'vegetal-featured': { name: 'Vegetal', currency: 'eur',
    priceCents: 400, description: 'Lechuga, tomate, millo, atún, zanahoria y mayonesa.' },

  // --- Bocadillos ---
  'bocadillo-moni': { name: 'Moni', currency: 'eur',
    priceCents: 440, description: 'Pollo al curry, crema de aguacate, queso tierno, pavo y tomate.' },
  'bocadillo-esther': { name: 'Esther', currency: 'eur',
    priceCents: 440, description: 'Pata, cebolla crujiente, queso tierno y salsa sueca.' },
  'bocadillo-fiona': { name: 'Fiona', currency: 'eur',
    priceCents: 440, description: 'Serrano, majoreno a la plancha, tomate y crema de aguacate.' },
  'bocadillo-carol': { name: 'Carol', currency: 'eur',
    priceCents: 440, description: 'Pavo, crema de aguacate, tortilla francesa, y queso majoreno.' },
  'bocadillo-carla': { name: 'Carla', currency: 'eur',
    priceCents: 430, description: 'Masa de pollo, crema de aguacate y queso.' },
  'bocadillo-rebeca': { name: 'Rebeca', currency: 'eur',
    priceCents: 440, description: 'Pollo, pimiento verde, cebolla y salsa sueca.' },
  'bocadillo-jamon-serrano-queso-tierno': { name: 'Jamón serrano y queso tierno', currency: 'eur',
    priceCents: 400 },
  'bocadillo-jamon-serrano-catalana': { name: 'Jamón serrano catalana', currency: 'eur',
    priceCents: 400 },
  'bocadillo-jamon-iberico-queso-tierno': { name: 'Jamón ibérico y queso tierno', currency: 'eur',
    priceCents: 500 },
  'bocadillo-jamon-iberico-catalana': { name: 'Jamón ibérico catalana', currency: 'eur',
    priceCents: 460 },
  'bocadillo-tortilla-pimientos': { name: 'Tortilla y pimientos verdes', currency: 'eur',
    priceCents: 400 },
  'bocadillo-pollo-curry': { name: 'Pollo al curry', currency: 'eur',
    priceCents: 400, description: 'Pollo al curry, mayonesa, lechuga y tomate.' },
  'bocadillo-carne-mechada': { name: 'Carne mechada', currency: 'eur',
    priceCents: 400, description: 'Carne mechada, queso gouda y salsa sueca.' },
  'bocadillo-lomo-especial': { name: 'Lomo especial', currency: 'eur',
    priceCents: 400, description: 'Lomo adobado, lechuga, tomate y zanahoria.' },
  'bocadillo-pata-tomate': { name: 'Pata y tomate', currency: 'eur',
    priceCents: 400 },
  'bocadillo-queso-tierno': { name: 'Queso tierno', currency: 'eur',
    priceCents: 400, description: 'Queso tierno, aceite, lechuga, tomate y orégano.' },
  'bocadillo-queso-calabacin-miel': { name: 'Queso tierno, calabacín y miel', currency: 'eur',
    priceCents: 400 },
  'bocadillo-vegetal': { name: 'Vegetal', currency: 'eur',
    priceCents: 400, description: 'Lechuga, tomate, millo, atún, zanahoria y mayonesa.' },

  // --- Extras y Suplementos ---
  'extra-extras': { name: 'Extras', currency: 'eur',
    priceCents: 100, description: 'Lomo, pata, pollo, serrano, atún, queso majoreno, queso tierno, ibérico, crema de aguacate, etc.' },
  'extra-suplementos': { name: 'Suplementos', currency: 'eur',
    priceCents: 50, description: 'Jamón, queso, etc.' },

  // --- Sandwiches ---
  'sandwich-calabacin-gouda-huevo': { name: 'Calabacín, queso gouda, huevo y salsa sueca', currency: 'eur',
    priceCents: 330 },
  'sandwich-cangrejo-berros-zanahoria': { name: 'Cangrejos, berros y zanahoria', currency: 'eur',
    priceCents: 300 },
  'sandwich-pollo-huevo': { name: 'Pollo y huevo', currency: 'eur',
    priceCents: 300 },
  'sandwich-pollo-huevo-gouda': { name: 'Pollo, huevo y queso gouda', currency: 'eur',
    priceCents: 330 },
  'sandwich-atun-huevo-gouda': { name: 'Atún, huevo y queso gouda', currency: 'eur',
    priceCents: 300 },
  'sandwich-atun-huevo-aguacate': { name: 'Atún, huevo y crema de aguacate', currency: 'eur',
    priceCents: 330 },
  'sandwich-atun-millo': { name: 'Atún y millo', currency: 'eur',
    priceCents: 280 },
  'sandwich-atun-pimiento': { name: 'Atún y pimiento', currency: 'eur',
    priceCents: 280 },
  'sandwich-cangrejo': { name: 'Cangrejo', currency: 'eur',
    priceCents: 280 },
  'sandwich-berros-queso': { name: 'Berros y queso tierno', currency: 'eur',
    priceCents: 320 },
  'sandwich-jamon-queso': { name: 'Jamón y queso', currency: 'eur',
    priceCents: 280 },
  'sandwich-vegetal': { name: 'Vegetal', currency: 'eur',
    priceCents: 320 },
  'sandwich-calabacin-queso': { name: 'Calabacín y queso tierno', currency: 'eur',
    priceCents: 300 },
  'sandwich-especiales': { name: 'Especiales', currency: 'eur',
    priceCents: 350 },

  // --- Croissants ---
  'croissant-vegetal': { name: 'Vegetal', currency: 'eur',
    priceCents: 400 },
  'croissant-jamon-queso': { name: 'Jamón y queso', currency: 'eur',
    priceCents: 300 },
  'croissant-atun-millo': { name: 'Atún y millo', currency: 'eur',
    priceCents: 300 },
  'croissant-tortilla': { name: 'Tortilla', currency: 'eur',
    priceCents: 300 },
  'croissant-especiales': { name: 'Especiales', currency: 'eur',
    priceCents: 450 },

  // --- Gofres y Tortitas ---
  'tortitas': { name: 'Tortitas', currency: 'eur',
    priceCents: 600, description: 'Topping: salsa de caramelo, chocolate, crema de Lotus, crema de cacahuete, chocolate blanco, mermelada, galleta Lotus, pistacho.' },

  // --- Crepes ---
  'crepe-mixto': { name: 'Mixto', currency: 'eur',
    priceCents: 600, description: 'Jamón y queso.' },
  'crepe-pizza': { name: 'Pizza', currency: 'eur',
    priceCents: 600, description: 'Mozzarella, atún, salsa de tomate, orégano y albahaca.' },
  'crepe-cacahuete-chocolate': { name: 'Crepe de crema de cacahuete y chocolate', currency: 'eur',
    priceCents: 600 },
  'crepe-caramelo': { name: 'Crepe de caramelo', currency: 'eur',
    priceCents: 600 },
  'crepe-dulce-leche': { name: 'Crepe de dulce de leche', currency: 'eur',
    priceCents: 600 },
  'crepe-chocomix': { name: 'Crepe Chocomix', currency: 'eur',
    priceCents: 600, description: 'Chocolate y chocolate blanco.' },
  'crepe-oreo': { name: 'Crepe Oreo', currency: 'eur',
    priceCents: 600, description: 'Chocolate blanco y galletas Oreo.' },
  'crepe-lotus': { name: 'Crepe Lotus', currency: 'eur',
    priceCents: 600, description: 'Crema de Lotus y galletas Lotus.' },

  // --- Dulces ---
  'dulce-tartas-variadas': { name: 'Tartas variadas', currency: 'eur',
    priceCents: 400 },
  'dulce-queso-casero': { name: 'Queso casero', currency: 'eur',
    priceCents: 250 },
  'dulce-cookies': { name: 'Variedad de Cookies', currency: 'eur',
    priceCents: 240 },

  // --- Suplementos dulces ---
  'suplemento-helado': { name: 'Bola de helado', currency: 'eur',
    priceCents: 100 },
  'suplemento-nata': { name: 'Nata', currency: 'eur',
    priceCents: 50 },

  // --- Cereales ---
  'cereales': { name: 'Cereales', currency: 'eur',
    priceCents: 400, description: 'Tamaños S, M y L. Leche entera, desnatada, sin lactosa, avena, soja o almendra.' },

  // --- Cafés ---
  'cafe-biberon': { name: 'Biberón', currency: 'eur',
    priceCents: 150 },
  'cafe-biberon-largo': { name: 'Biberón largo', currency: 'eur',
    priceCents: 190 },
  'cafe-expreso': { name: 'Expreso', currency: 'eur',
    priceCents: 125 },
  'cafe-expreso-doble': { name: 'Expreso doble', currency: 'eur',
    priceCents: 175 },
  'cafe-c-doble': { name: 'C. doble', currency: 'eur',
    priceCents: 225 },
  'cafe-americano': { name: 'Americano', currency: 'eur',
    priceCents: 180 },
  'cafe-hielo': { name: 'Café hielo', currency: 'eur',
    priceCents: 210 },
  'cafe-cortado': { name: 'Cortado', currency: 'eur',
    priceCents: 140 },
  'cafe-cortado-largo': { name: 'Cortado largo', currency: 'eur',
    priceCents: 180 },
  'cafe-capuchino': { name: 'Capuchino', currency: 'eur',
    priceCents: 250 },
  'cafe-con-leche': { name: 'Café con leche', currency: 'eur',
    priceCents: 200 },
  'cafe-leche-leche-corto': { name: 'Leche y leche corto', currency: 'eur',
    priceCents: 150 },
  'cafe-leche-leche-largo': { name: 'Leche y leche largo', currency: 'eur',
    priceCents: 190 },
  'cafe-con-leche-tanque': { name: 'Café con leche tanque', currency: 'eur',
    priceCents: 270 },
  'cafe-capuchino-tanque': { name: 'Capuchino tanque', currency: 'eur',
    priceCents: 280 },
  'cafe-leche-leche-tanque': { name: 'Leche y leche tanque', currency: 'eur',
    priceCents: 280 },
  'cafe-colacao': { name: 'ColaCao', currency: 'eur',
    priceCents: 230 },
  'cafe-colacao-tanque': { name: 'ColaCao tanque', currency: 'eur',
    priceCents: 250 },
  'cafe-vaso-leche': { name: 'Vaso de leche', currency: 'eur',
    priceCents: 120 },
  'cafe-chocolate-taza': { name: 'Chocolate a la taza', currency: 'eur',
    priceCents: 250 },

  // --- Infusiones ---
  'infusion-manzanilla': { name: 'Manzanilla', currency: 'eur',
    priceCents: 200 },
  'infusion-menta-poleo': { name: 'Menta Poleo', currency: 'eur',
    priceCents: 200 },
  'infusion-frutos-bosque': { name: 'Frutos del bosque', currency: 'eur',
    priceCents: 250 },
  'infusion-te-verde-rojo-negro': { name: 'Té verde, rojo, negro', currency: 'eur',
    priceCents: 230 },
  'infusion-te-americano': { name: 'Té americano', currency: 'eur',
    priceCents: 260 },
  'infusion-te-matcha': { name: 'Té matcha', currency: 'eur',
    priceCents: 400 },

  // --- Cafés Especiales ---
  'especial-lotus': { name: 'Lotus', currency: 'eur',
    priceCents: 450, description: 'Café, crema de leche, crema lotus, galletas lotus.' },
  'especial-barraquito': { name: 'Barraquito', currency: 'eur',
    priceCents: 450, description: 'Café, condensada, licor 43, crema de leche, canela, limón.' },
  'especial-cafe-carla': { name: 'Café Carla', currency: 'eur',
    priceCents: 450, description: 'Café, condensada, bayleis, crema de leche.' },
  'especial-moka': { name: 'Moka', currency: 'eur',
    priceCents: 450, description: 'Café, chocolate, nata.' },
  'especial-cafe-titi': { name: 'Café Titi', currency: 'eur',
    priceCents: 450, description: 'Café, tía María, crema de leche.' },
  'especial-cafe-caramel': { name: 'Café Caramel', currency: 'eur',
    priceCents: 450, description: 'Café, caramelo, crema de leche, nata.' },
  'especial-chocolate-suizo': { name: 'Chocolate Suizo', currency: 'eur',
    priceCents: 450 },

  // --- Suplementos cafés ---
  'suplemento-licores': { name: 'Licores', currency: 'eur',
    priceCents: 50, description: 'Licor Tía María, Licor 43, Baileys.' },
  'suplemento-nata-condensada-leche': { name: 'Nata, Condensada y Leche', currency: 'eur',
    priceCents: 30 },
  'suplemento-vegetal-sin-lactosa': { name: 'Bebidas vegetales y sin lactosa', currency: 'eur',
    priceCents: 20 },
  'suplemento-canela': { name: 'Canela', currency: 'eur',
    priceCents: 20 },
};

export function getCatalogItem(itemId: string): CatalogItem | undefined {
  return CATALOG[itemId];
}

export function isSellable(itemId: string): boolean {
  const item = CATALOG[itemId];
  return Boolean(item && item.priceCents > 0);
}
