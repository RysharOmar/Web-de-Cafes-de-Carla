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
    priceCents: 150 },
  'moni-featured': { name: 'Pollo y huevo', currency: 'eur',
    priceCents: 125 },
  'vegetal-featured': { name: 'Vegetal', currency: 'eur',
    priceCents: 150 },

  // --- Bocadillos ---
  'bocadillo-calabacin-gouda-huevo': { name: 'Calabacín, queso gouda, huevo y salsa sueca', currency: 'eur',
    priceCents: 150 },
  'bocadillo-cangrejo-berros-zanahoria': { name: 'Cangrejo, berros y zanahoria', currency: 'eur',
    priceCents: 125 },
  'bocadillo-pollo-huevo': { name: 'Pollo y huevo', currency: 'eur',
    priceCents: 125 },
  'bocadillo-atun-huevo-gouda': { name: 'Atún, huevo y queso gouda', currency: 'eur',
    priceCents: 150 },
  'bocadillo-atun-huevo-aguacate': { name: 'Atún, huevo y aguacate', currency: 'eur',
    priceCents: 150 },
  'bocadillo-vegetal': { name: 'Vegetal', currency: 'eur',
    priceCents: 150 },
  'bocadillo-jamon-queso': { name: 'Jamón y queso', currency: 'eur',
    priceCents: 120 },
  'bocadillo-atun-millo': { name: 'Atún y millo', currency: 'eur',
    priceCents: 120 },
  'bocadillo-atun-pimiento': { name: 'Atún y pimiento', currency: 'eur',
    priceCents: 120 },
  'bocadillo-especial': { name: 'Bocadillo especial', currency: 'eur',
    priceCents: 170 },

  // --- Tostadas ---
  'tostada-jamon-serrano-queso-tierno': { name: 'Jamón serrano y queso tierno', currency: 'eur',
    priceCents: 220 },
  'tostada-jamon-iberico-queso-tierno': { name: 'Jamón ibérico y queso tierno', currency: 'eur',
    priceCents: 300 },
  'tostada-queso-tierno-salmon': { name: 'Queso tierno y salmón', currency: 'eur',
    priceCents: 220 },
  'tostada-pata-tomate': { name: 'Pata y tomate', currency: 'eur',
    priceCents: 220 },
  'tostada-queso-tierno': { name: 'Queso tierno', currency: 'eur',
    priceCents: 220 },
  'tostada-queso-calabacin-miel': { name: 'Queso tierno, calabacín y miel', currency: 'eur',
    priceCents: 220 },

  // --- Croissants ---
  'croissant-vegetal': { name: 'Vegetal', currency: 'eur',
    priceCents: 200 },
  'croissant-jamon-queso': { name: 'Jamón y queso', currency: 'eur',
    priceCents: 250 },
  'croissant-atun-millo': { name: 'Atún y millo', currency: 'eur',
    priceCents: 250 },
  'croissant-tortilla': { name: 'Tortilla', currency: 'eur',
    priceCents: 250 },
  'croissant-especiales': { name: 'Especiales', currency: 'eur',
    priceCents: 350 },

  // --- Tortitas ---
  'tortitas-nata-azucar': { name: 'Nata con azúcar', currency: 'eur',
    priceCents: 450 },
  'tortitas-chocolate-crema-nata': { name: 'Chocolate con crema y nata', currency: 'eur',
    priceCents: 450 },
  'tortitas-crema-cacao-nata': { name: 'Crema de cacao y nata', currency: 'eur',
    priceCents: 450 },
  'tortitas-crema-chocolate-blanco': { name: 'Crema de chocolate blanco', currency: 'eur',
    priceCents: 450 },
  'tortitas-crema-chocolate-blanco-fresas': { name: 'Crema de chocolate blanco y fresas', currency: 'eur',
    priceCents: 450 },
  'tortitas-crema-cacao-fresas-platano': { name: 'Crema de cacao con fresas y plátano', currency: 'eur',
    priceCents: 450 },
  'tortitas-crema-chocolate-fresas-platano': { name: 'Crema de chocolate con fresas y plátano', currency: 'eur',
    priceCents: 450 },

  // --- Tortas ---
  'torta-jamon-serrano-queso-tierno': { name: 'Jamón serrano y queso tierno', currency: 'eur',
    priceCents: 300 },
  'torta-jamon-iberico-queso-tierno': { name: 'Jamón ibérico y queso tierno', currency: 'eur',
    priceCents: 300 },
  'torta-queso-tierno-salmon': { name: 'Queso tierno y salmón', currency: 'eur',
    priceCents: 220 },
  'torta-queso-tierno': { name: 'Queso tierno', currency: 'eur',
    priceCents: 220 },
  'torta-queso-calabacin-miel': { name: 'Queso tierno, calabacín y miel', currency: 'eur',
    priceCents: 220 },

  // --- Bebidas y batidos ---
  'agua': { name: 'Agua', currency: 'eur',
    priceCents: 100 },
  'refrescos': { name: 'Refrescos', currency: 'eur',
    priceCents: 120 },
  'jugo-natural': { name: 'Jugo natural', currency: 'eur',
    priceCents: 150 },

  // --- Suplementos ---
  'suplemento-leche': { name: 'Leche', currency: 'eur',
    priceCents: 50 },
  'suplemento-mantequilla': { name: 'Mantequilla', currency: 'eur',
    priceCents: 50 },
  'suplemento-mermelada': { name: 'Mermelada', currency: 'eur',
    priceCents: 50 },

  // --- Tartas dulces ---
  'tarta-casera': { name: 'Tarta casera', currency: 'eur',
    priceCents: 300 },
  'queque-casero': { name: 'Queque casero', currency: 'eur',
    priceCents: 250 },
  'torta-de-la-abuela': { name: 'Tarta de la abuela', currency: 'eur',
    priceCents: 280 },

  // --- Tartas ---
  'porcion-tarta': { name: 'Porción de tarta', currency: 'eur',
    priceCents: 280 },

  // --- Cafés ---
  'cafe-colacao': { name: 'Cola Cao', currency: 'eur',
    priceCents: 120 },
  'cafe-leche-colacao': { name: 'Leche con Cola Cao', currency: 'eur',
    priceCents: 150 },
  'cafe-chocolate': { name: 'Chocolate', currency: 'eur',
    priceCents: 150 },
  'cafe-suizo': { name: 'Suizo', currency: 'eur',
    priceCents: 150 },
  'cafe-solo': { name: 'Café solo', currency: 'eur',
    priceCents: 120 },
  'cafe-doble': { name: 'Café doble', currency: 'eur',
    priceCents: 150 },
  'cafe-americano': { name: 'Café americano', currency: 'eur',
    priceCents: 120 },
  'cafe-hielo': { name: 'Café con hielo', currency: 'eur',
    priceCents: 120 },
  'jarra-leche': { name: 'Jarra de leche', currency: 'eur',
    priceCents: 100 },
  'jarra-cafe': { name: 'Jarra de café', currency: 'eur',
    priceCents: 120 },
  'cafe-con-leche': { name: 'Café con leche', currency: 'eur',
    priceCents: 150 },
  'capuccino': { name: 'Capuccino', currency: 'eur',
    priceCents: 170 },
  'vaso-leche': { name: 'Vaso de leche', currency: 'eur',
    priceCents: 100 },
  'cortado-largo': { name: 'Cortado largo', currency: 'eur',
    priceCents: 150 },
  'cortado-corto': { name: 'Cortado corto', currency: 'eur',
    priceCents: 120 },
  'barraquito': { name: 'Barraquito', currency: 'eur',
    priceCents: 200 },
  'moka': { name: 'Moka', currency: 'eur',
    priceCents: 200 },
  'cafe-carla': { name: 'Café Carla', currency: 'eur',
    priceCents: 200, description: 'Baileys o Tía María.' },
  'lotus': { name: 'Lotus', currency: 'eur',
    priceCents: 200 },
  'seno': { name: 'Sureño', currency: 'eur',
    priceCents: 200 },

  // --- Cafés especiales ---
  'barraquito-cafe': { name: 'Barraquito de café', currency: 'eur',
    priceCents: 200 },
  'moka-especial': { name: 'Moka', currency: 'eur',
    priceCents: 200 },
  'leche-leche-largo': { name: 'Leche y leche largo', currency: 'eur',
    priceCents: 170 },
  'leche-leche': { name: 'Leche y leche', currency: 'eur',
    priceCents: 150 },
  'cafe-tanque-leche': { name: 'Café tanque con leche', currency: 'eur',
    priceCents: 150 },
  'cafe-tanque-leche-leche': { name: 'Café tanque leche y leche', currency: 'eur',
    priceCents: 150 },
  'bibe-largo': { name: 'Bibe largo', currency: 'eur',
    priceCents: 150 },
  'bibe': { name: 'Bibe', currency: 'eur',
    priceCents: 120 },

  // --- Cereales ---
  'cereales': { name: 'Cereales', currency: 'eur',
    priceCents: 200, description: 'Leche entera, desnatada, soja o almendra.' },

  // --- Infusiones ---
  'infusion-manzanilla': { name: 'Manzanilla', currency: 'eur',
    priceCents: 100 },
  'infusion-te-verde': { name: 'Té verde', currency: 'eur',
    priceCents: 100 },
  'infusion-te-rojo': { name: 'Té rojo', currency: 'eur',
    priceCents: 100 },
  'infusion-te-frutas': { name: 'Té de frutas', currency: 'eur',
    priceCents: 100 },
  'infusion-menta': { name: 'Menta', currency: 'eur',
    priceCents: 100 },
};

export function getCatalogItem(itemId: string): CatalogItem | undefined {
  return CATALOG[itemId];
}

export function isSellable(itemId: string): boolean {
  const item = CATALOG[itemId];
  return Boolean(item && item.priceCents > 0);
}
