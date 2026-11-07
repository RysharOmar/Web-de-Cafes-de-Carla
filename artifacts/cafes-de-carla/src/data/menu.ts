export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  sizes: Array<{ label: string; priceCents: number }>; // ej: [{label:'Mini',priceCents:285},{label:'Normal',priceCents:440}]
  defaultSize: string;
  variants?: string[];         // ej: ["Leche entera","Leche desnatada",...]
  defaultVariant?: string;
  agotado?: boolean;
};

export type MenuCategory = {
  id: string;
  title: string;
  note: string;
  image: string | null;
  alt: string;
  items: MenuItem[];
  emptyMessage?: string;
};

const m = (
  id: string,
  name: string,
  description: string | undefined,
  sizes: Array<{ label: string; priceCents: number }>,
  defaultSize: string,
  variants?: string[],
  defaultVariant?: string,
): MenuItem => ({ id, name, description, sizes, defaultSize, variants, defaultVariant });

export const menuCategories: MenuCategory[] = [
  // ================= FEATURED =================
  {
    id: 'featured',
    title: 'A primera vista',
    note: 'Algunos favoritos que aparecen destacados en la carta.',
    image: '/sample-brunch.jpg',
    alt: 'Imagen ilustrativa de desayuno; no corresponde a un producto confirmado',
    items: [
      m('calabacin-gouda-huevo', 'Calabacín, queso gouda, huevo y salsa sueca', undefined,
        [{ label: 'Mini', priceCents: 170 }, { label: 'Normal', priceCents: 330 }], 'Normal'),
      m('moni-featured', 'Moni', 'Pollo al curry, crema de aguacate, queso tierno, pavo y tomate.',
        [{ label: 'Mini', priceCents: 285 }, { label: 'Normal', priceCents: 440 }], 'Normal'),
      m('vegetal-featured', 'Vegetal', 'Lechuga, tomate, millo, atún, zanahoria y mayonesa.',
        [{ label: 'Mini', priceCents: 230 }, { label: 'Normal', priceCents: 400 }], 'Normal'),
    ],
  },
  // ================= BOCADILLOS =================
  {
    id: 'bocadillos',
    title: 'Bocadillos',
    note: 'Mini y normal. Precios según carta de Cafés de Carla.',
    image: '/sample-brunch.jpg',
    alt: 'Imagen ilustrativa de bocadillos',
    items: [
      m('bocadillo-moni', 'Moni', 'Pollo al curry, crema de aguacate, queso tierno, pavo y tomate.',
        [{ label: 'Mini', priceCents: 285 }, { label: 'Normal', priceCents: 440 }], 'Normal'),
      m('bocadillo-esther', 'Esther', 'Pata, cebolla crujiente, queso tierno y salsa sueca.',
        [{ label: 'Mini', priceCents: 285 }, { label: 'Normal', priceCents: 440 }], 'Normal'),
      m('bocadillo-fiona', 'Fiona', 'Serrano, majoreno a la plancha, tomate y crema de aguacate.',
        [{ label: 'Mini', priceCents: 285 }, { label: 'Normal', priceCents: 440 }], 'Normal'),
      m('bocadillo-carol', 'Carol', 'Pavo, crema de aguacate, tortilla francesa, y queso majoreno.',
        [{ label: 'Mini', priceCents: 285 }, { label: 'Normal', priceCents: 440 }], 'Normal'),
      m('bocadillo-carla', 'Carla', 'Masa de pollo, crema de aguacate y queso.',
        [{ label: 'Mini', priceCents: 260 }, { label: 'Normal', priceCents: 430 }], 'Normal'),
      m('bocadillo-rebeca', 'Rebeca', 'Pollo, pimiento verde, cebolla y salsa sueca.',
        [{ label: 'Mini', priceCents: 285 }, { label: 'Normal', priceCents: 440 }], 'Normal'),
      m('bocadillo-jamon-serrano-queso-tierno', 'Jamón serrano y queso tierno', undefined,
        [{ label: 'Mini', priceCents: 230 }, { label: 'Normal', priceCents: 400 }], 'Normal'),
      m('bocadillo-jamon-serrano-catalana', 'Jamón serrano catalana', undefined,
        [{ label: 'Mini', priceCents: 230 }, { label: 'Normal', priceCents: 400 }], 'Normal'),
      m('bocadillo-jamon-iberico-queso-tierno', 'Jamón ibérico y queso tierno', undefined,
        [{ label: 'Mini', priceCents: 280 }, { label: 'Normal', priceCents: 500 }], 'Normal'),
      m('bocadillo-jamon-iberico-catalana', 'Jamón ibérico catalana', undefined,
        [{ label: 'Mini', priceCents: 260 }, { label: 'Normal', priceCents: 460 }], 'Normal'),
      m('bocadillo-tortilla-pimientos', 'Tortilla y pimientos verdes', undefined,
        [{ label: 'Mini', priceCents: 230 }, { label: 'Normal', priceCents: 400 }], 'Normal'),
      m('bocadillo-pollo-curry', 'Pollo al curry', 'Pollo al curry, mayonesa, lechuga y tomate.',
        [{ label: 'Mini', priceCents: 230 }, { label: 'Normal', priceCents: 400 }], 'Normal'),
      m('bocadillo-carne-mechada', 'Carne mechada', 'Carne mechada, queso gouda y salsa sueca.',
        [{ label: 'Mini', priceCents: 230 }, { label: 'Normal', priceCents: 400 }], 'Normal'),
      m('bocadillo-lomo-especial', 'Lomo especial', 'Lomo adobado, lechuga, tomate y zanahoria.',
        [{ label: 'Mini', priceCents: 230 }, { label: 'Normal', priceCents: 400 }], 'Normal'),
      m('bocadillo-pata-tomate', 'Pata y tomate', undefined,
        [{ label: 'Mini', priceCents: 230 }, { label: 'Normal', priceCents: 400 }], 'Normal'),
      m('bocadillo-queso-tierno', 'Queso tierno', 'Queso tierno, aceite, lechuga, tomate y orégano.',
        [{ label: 'Mini', priceCents: 230 }, { label: 'Normal', priceCents: 400 }], 'Normal'),
      m('bocadillo-queso-calabacin-miel', 'Queso tierno, calabacín y miel', undefined,
        [{ label: 'Mini', priceCents: 230 }, { label: 'Normal', priceCents: 400 }], 'Normal'),
      m('bocadillo-vegetal', 'Vegetal', 'Lechuga, tomate, millo, atún, zanahoria y mayonesa.',
        [{ label: 'Mini', priceCents: 230 }, { label: 'Normal', priceCents: 400 }], 'Normal'),
    ],
  },
  // ================= EXTRAS Y SUPLEMENTOS =================
  {
    id: 'extras-suplementos',
    title: 'Extras y Suplementos',
    note: 'Extras para tus bocadillos y tostadas.',
    image: null,
    alt: '',
    items: [
      m('extra-extras', 'Extras', 'Lomo, pata, pollo, serrano, atún, queso majoreno, queso tierno, ibérico, crema de aguacate, etc.',
        [{ label: 'Unidad', priceCents: 100 }], 'Unidad'),
      m('extra-suplementos', 'Suplementos', 'Jamón, queso, etc.',
        [{ label: 'Unidad', priceCents: 50 }], 'Unidad'),
    ],
  },
  // ================= SANDWICHES =================
  {
    id: 'sandwiches',
    title: 'Sandwiches',
    note: 'Medio y normal. Precio IGIC incluido.',
    image: '/sample-brunch.jpg',
    alt: 'Imagen ilustrativa de sandwiches',
    items: [
      m('sandwich-calabacin-gouda-huevo', 'Calabacín, queso gouda, huevo y salsa sueca', undefined,
        [{ label: 'Medio', priceCents: 170 }, { label: 'Normal', priceCents: 330 }], 'Normal'),
      m('sandwich-cangrejo-berros-zanahoria', 'Cangrejos, berros y zanahoria', undefined,
        [{ label: 'Medio', priceCents: 150 }, { label: 'Normal', priceCents: 300 }], 'Normal'),
      m('sandwich-pollo-huevo', 'Pollo y huevo', undefined,
        [{ label: 'Medio', priceCents: 150 }, { label: 'Normal', priceCents: 300 }], 'Normal'),
      m('sandwich-pollo-huevo-gouda', 'Pollo, huevo y queso gouda', undefined,
        [{ label: 'Medio', priceCents: 170 }, { label: 'Normal', priceCents: 330 }], 'Normal'),
      m('sandwich-atun-huevo-gouda', 'Atún, huevo y queso gouda', undefined,
        [{ label: 'Medio', priceCents: 150 }, { label: 'Normal', priceCents: 300 }], 'Normal'),
      m('sandwich-atun-huevo-aguacate', 'Atún, huevo y crema de aguacate', undefined,
        [{ label: 'Medio', priceCents: 170 }, { label: 'Normal', priceCents: 330 }], 'Normal'),
      m('sandwich-atun-millo', 'Atún y millo', undefined,
        [{ label: 'Medio', priceCents: 150 }, { label: 'Normal', priceCents: 280 }], 'Normal'),
      m('sandwich-atun-pimiento', 'Atún y pimiento', undefined,
        [{ label: 'Medio', priceCents: 150 }, { label: 'Normal', priceCents: 280 }], 'Normal'),
      m('sandwich-cangrejo', 'Cangrejo', undefined,
        [{ label: 'Medio', priceCents: 150 }, { label: 'Normal', priceCents: 280 }], 'Normal'),
      m('sandwich-berros-queso', 'Berros y queso tierno', undefined,
        [{ label: 'Medio', priceCents: 170 }, { label: 'Normal', priceCents: 320 }], 'Normal'),
      m('sandwich-jamon-queso', 'Jamón y queso', undefined,
        [{ label: 'Normal', priceCents: 280 }], 'Normal'),
      m('sandwich-vegetal', 'Vegetal', undefined,
        [{ label: 'Normal', priceCents: 320 }], 'Normal'),
      m('sandwich-calabacin-queso', 'Calabacín y queso tierno', undefined,
        [{ label: 'Medio', priceCents: 150 }, { label: 'Normal', priceCents: 300 }], 'Normal'),
      m('sandwich-especiales', 'Especiales', undefined,
        [{ label: 'Normal', priceCents: 350 }], 'Normal'),
    ],
  },
  // ================= CROISSANTS =================
  {
    id: 'croissants',
    title: 'Croissant',
    note: 'Precio IGIC incluido.',
    image: '/sample-brunch.jpg',
    alt: 'Imagen ilustrativa de croissants',
    items: [
      m('croissant-vegetal', 'Vegetal', undefined, [{ label: 'Unidad', priceCents: 400 }], 'Unidad'),
      m('croissant-jamon-queso', 'Jamón y queso', undefined, [{ label: 'Unidad', priceCents: 300 }], 'Unidad'),
      m('croissant-atun-millo', 'Atún y millo', undefined, [{ label: 'Unidad', priceCents: 300 }], 'Unidad'),
      m('croissant-tortilla', 'Tortilla', undefined, [{ label: 'Unidad', priceCents: 300 }], 'Unidad'),
      m('croissant-especiales', 'Especiales', undefined, [{ label: 'Unidad', priceCents: 450 }], 'Unidad'),
    ],
  },
  // ================= GOFRES Y TORTITAS =================
  {
    id: 'gofres-tortitas',
    title: 'Gofres y Tortitas',
    note: 'Tortitas 6,00 €. Toppings: salsa de caramelo, chocolate, crema de Lotus, crema de cacahuete, chocolate blanco, mermelada, galleta Lotus, pistacho.',
    image: '/sample-brunch.jpg',
    alt: 'Imagen ilustrativa de tortitas',
    items: [
      m('tortitas', 'Tortitas', 'Elige tu topping: caramelo, chocolate, crema de Lotus, crema de cacahuete, chocolate blanco, mermelada, galleta Lotus o pistacho.',
        [{ label: 'Unidad', priceCents: 600 }], 'Unidad'),
    ],
  },
  // ================= CREPES =================
  {
    id: 'crepes',
    title: 'Crepes (Salados y Dulces)',
    note: 'Precio general: 6,00 €.',
    image: '/sample-brunch.jpg',
    alt: 'Imagen ilustrativa de crepes',
    items: [
      m('crepe-mixto', 'Mixto', 'Jamón y queso.', [{ label: 'Unidad', priceCents: 600 }], 'Unidad'),
      m('crepe-pizza', 'Pizza', 'Mozzarella, atún, salsa de tomate, orégano y albahaca.', [{ label: 'Unidad', priceCents: 600 }], 'Unidad'),
      m('crepe-cacahuete-chocolate', 'Crepe de crema de cacahuete y chocolate', undefined, [{ label: 'Unidad', priceCents: 600 }], 'Unidad'),
      m('crepe-caramelo', 'Crepe de caramelo', undefined, [{ label: 'Unidad', priceCents: 600 }], 'Unidad'),
      m('crepe-dulce-leche', 'Crepe de dulce de leche', undefined, [{ label: 'Unidad', priceCents: 600 }], 'Unidad'),
      m('crepe-chocomix', 'Crepe Chocomix', 'Chocolate y chocolate blanco.', [{ label: 'Unidad', priceCents: 600 }], 'Unidad'),
      m('crepe-oreo', 'Crepe Oreo', 'Chocolate blanco y galletas Oreo.', [{ label: 'Unidad', priceCents: 600 }], 'Unidad'),
      m('crepe-lotus', 'Crepe Lotus', 'Crema de Lotus y galletas Lotus.', [{ label: 'Unidad', priceCents: 600 }], 'Unidad'),
    ],
  },
  // ================= DULCES Y SUPLEMENTOS =================
  {
    id: 'dulces-suplementos',
    title: 'Dulces y Suplementos',
    note: 'Repostería y suplementos dulces.',
    image: '/sample-brunch.jpg',
    alt: 'Imagen ilustrativa de dulces',
    items: [
      m('dulce-tartas-variadas', 'Tartas variadas', undefined, [{ label: 'Unidad', priceCents: 400 }], 'Unidad'),
      m('dulce-queso-casero', 'Queso casero', undefined, [{ label: 'Unidad', priceCents: 250 }], 'Unidad'),
      m('dulce-cookies', 'Variedad de Cookies', undefined, [{ label: 'Unidad', priceCents: 240 }], 'Unidad'),
      m('suplemento-helado', 'Bola de helado', undefined, [{ label: 'Unidad', priceCents: 100 }], 'Unidad'),
      m('suplemento-nata', 'Nata', undefined, [{ label: 'Unidad', priceCents: 50 }], 'Unidad'),
    ],
  },
  // ================= CEREALES =================
  {
    id: 'cereales',
    title: 'Cereales',
    note: 'Elige tu leche favorita: entera, desnatada, sin lactosa, avena, soja o almendra.',
    image: null,
    alt: '',
    items: [
      m('cereales', 'Cereales', 'Tamaños S, M y L.',
        [{ label: 'S', priceCents: 300 }, { label: 'M', priceCents: 360 }, { label: 'L', priceCents: 400 }], 'L',
        ['Leche entera', 'Leche desnatada', 'Leche sin lactosa', 'Leche de avena', 'Leche de soja', 'Leche de almendra'],
        'Leche entera'),
    ],
  },
  // ================= CAFÉS =================
  {
    id: 'cafes',
    title: 'Cafés',
    note: 'Precios según carta.',
    image: null,
    alt: '',
    items: [
      m('cafe-biberon', 'Biberón', undefined, [{ label: 'Unidad', priceCents: 150 }], 'Unidad'),
      m('cafe-biberon-largo', 'Biberón largo', undefined, [{ label: 'Unidad', priceCents: 190 }], 'Unidad'),
      m('cafe-expreso', 'Expreso', undefined, [{ label: 'Unidad', priceCents: 125 }], 'Unidad'),
      m('cafe-expreso-doble', 'Expreso doble', undefined, [{ label: 'Unidad', priceCents: 175 }], 'Unidad'),
      m('cafe-c-doble', 'C. doble', undefined, [{ label: 'Unidad', priceCents: 225 }], 'Unidad'),
      m('cafe-americano', 'Americano', undefined, [{ label: 'Unidad', priceCents: 180 }], 'Unidad'),
      m('cafe-hielo', 'Café hielo', undefined, [{ label: 'Unidad', priceCents: 210 }], 'Unidad'),
      m('cafe-cortado', 'Cortado', undefined, [{ label: 'Unidad', priceCents: 140 }], 'Unidad'),
      m('cafe-cortado-largo', 'Cortado largo', undefined, [{ label: 'Unidad', priceCents: 180 }], 'Unidad'),
      m('cafe-capuchino', 'Capuchino', undefined, [{ label: 'Unidad', priceCents: 250 }], 'Unidad'),
      m('cafe-con-leche', 'Café con leche', undefined, [{ label: 'Unidad', priceCents: 200 }], 'Unidad'),
      m('cafe-leche-leche-corto', 'Leche y leche corto', undefined, [{ label: 'Unidad', priceCents: 150 }], 'Unidad'),
      m('cafe-leche-leche-largo', 'Leche y leche largo', undefined, [{ label: 'Unidad', priceCents: 190 }], 'Unidad'),
      m('cafe-con-leche-tanque', 'Café con leche tanque', undefined, [{ label: 'Unidad', priceCents: 270 }], 'Unidad'),
      m('cafe-capuchino-tanque', 'Capuchino tanque', undefined, [{ label: 'Unidad', priceCents: 280 }], 'Unidad'),
      m('cafe-leche-leche-tanque', 'Leche y leche tanque', undefined, [{ label: 'Unidad', priceCents: 280 }], 'Unidad'),
      m('cafe-colacao', 'ColaCao', undefined, [{ label: 'Unidad', priceCents: 230 }], 'Unidad'),
      m('cafe-colacao-tanque', 'ColaCao tanque', undefined, [{ label: 'Unidad', priceCents: 250 }], 'Unidad'),
      m('cafe-vaso-leche', 'Vaso de leche', undefined, [{ label: 'Unidad', priceCents: 120 }], 'Unidad'),
      m('cafe-chocolate-taza', 'Chocolate a la taza', undefined, [{ label: 'Unidad', priceCents: 250 }], 'Unidad'),
    ],
  },
  // ================= INFUSIONES =================
  {
    id: 'infusiones',
    title: 'Infusiones',
    note: 'Precios según carta.',
    image: null,
    alt: '',
    items: [
      m('infusion-manzanilla', 'Manzanilla', undefined, [{ label: 'Unidad', priceCents: 200 }], 'Unidad'),
      m('infusion-menta-poleo', 'Menta Poleo', undefined, [{ label: 'Unidad', priceCents: 200 }], 'Unidad'),
      m('infusion-frutos-bosque', 'Frutos del bosque', undefined, [{ label: 'Unidad', priceCents: 250 }], 'Unidad'),
      m('infusion-te-verde-rojo-negro', 'Té verde, rojo, negro', undefined, [{ label: 'Unidad', priceCents: 230 }], 'Unidad'),
      m('infusion-te-americano', 'Té americano', undefined, [{ label: 'Unidad', priceCents: 260 }], 'Unidad'),
      m('infusion-te-matcha', 'Té matcha', undefined, [{ label: 'Unidad', priceCents: 400 }], 'Unidad'),
    ],
  },
  // ================= CAFÉS ESPECIALES =================
  {
    id: 'cafes-especiales',
    title: 'Cafés Especiales',
    note: 'Precios según carta.',
    image: null,
    alt: '',
    items: [
      m('especial-lotus', 'Lotus', 'Café, crema de leche, crema lotus, galletas lotus.', [{ label: 'Unidad', priceCents: 450 }], 'Unidad'),
      m('especial-barraquito', 'Barraquito', 'Café, condensada, licor 43, crema de leche, canela, limón.', [{ label: 'Unidad', priceCents: 450 }], 'Unidad'),
      m('especial-cafe-carla', 'Café Carla', 'Café, condensada, bayleis, crema de leche.', [{ label: 'Unidad', priceCents: 450 }], 'Unidad'),
      m('especial-moka', 'Moka', 'Café, chocolate, nata.', [{ label: 'Unidad', priceCents: 450 }], 'Unidad'),
      m('especial-cafe-titi', 'Café Titi', 'Café, tía María, crema de leche.', [{ label: 'Unidad', priceCents: 450 }], 'Unidad'),
      m('especial-cafe-caramel', 'Café Caramel', 'Café, caramelo, crema de leche, nata.', [{ label: 'Unidad', priceCents: 450 }], 'Unidad'),
      m('especial-chocolate-suizo', 'Chocolate Suizo', undefined, [{ label: 'Unidad', priceCents: 450 }], 'Unidad'),
    ],
  },
  // ================= SUPLEMENTOS CAFÉS =================
  {
    id: 'suplementos-cafe',
    title: 'Suplementos (Cafés)',
    note: 'Suplementos para cafés especiales.',
    image: null,
    alt: '',
    items: [
      m('suplemento-licores', 'Licores', 'Licor Tía María, Licor 43, Baileys.', [{ label: 'Unidad', priceCents: 50 }], 'Unidad'),
      m('suplemento-nata-condensada-leche', 'Nata, Condensada y Leche', undefined, [{ label: 'Unidad', priceCents: 30 }], 'Unidad'),
      m('suplemento-vegetal-sin-lactosa', 'Bebidas vegetales y sin lactosa', undefined, [{ label: 'Unidad', priceCents: 20 }], 'Unidad'),
      m('suplemento-canela', 'Canela', undefined, [{ label: 'Unidad', priceCents: 20 }], 'Unidad'),
    ],
  },
];
