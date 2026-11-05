export type MenuItem = {
  id: string;
  name: string;
  price?: string;        // Precio "normal" por defecto (o único)
  miniPrice?: string;    // Precio mini / medio si aplica
  description?: string;
  variants?: string[];   // Ej: ["Leche entera", "Leche desnatada", ...]
  sizes?: string[];      // Ej: ["S", "M", "L"] para cereales
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

const menuItem = (
  id: string,
  name: string,
  price?: string,
  description?: string,
  miniPrice?: string,
  variants?: string[],
  sizes?: string[],
): MenuItem => ({ id, name, price, description, miniPrice, variants, sizes });

export const menuCategories: MenuCategory[] = [
  {
    id: 'featured',
    title: 'A primera vista',
    note: 'Algunos favoritos que aparecen destacados en la carta.',
    image: '/sample-brunch.jpg',
    alt: 'Imagen ilustrativa de desayuno; no corresponde a un producto confirmado',
    items: [
      menuItem(
        'calabacin-gouda-huevo',
        'Calabacín, queso gouda, huevo y salsa sueca',
        '3,30 €',
        undefined,
        '1,70 €',
      ),
      menuItem(
        'moni-featured',
        'Moni',
        '4,40 €',
        'Pollo al curry, crema de aguacate, queso tierno, pavo y tomate.',
        '2,85 €',
      ),
      menuItem(
        'vegetal-featured',
        'Vegetal',
        '4,00 €',
        'Lechuga, tomate, millo, atún, zanahoria y mayonesa.',
        '2,30 €',
      ),
    ],
  },
  {
    id: 'bocadillos',
    title: 'Bocadillos',
    note: 'Mini y normal. Precios según carta de Cafés de Carla.',
    image: '/sample-brunch.jpg',
    alt: 'Imagen ilustrativa de bocadillos',
    items: [
      menuItem('bocadillo-moni', 'Moni', '4,40 €', 'Pollo al curry, crema de aguacate, queso tierno, pavo y tomate.', '2,85 €'),
      menuItem('bocadillo-esther', 'Esther', '4,40 €', 'Pata, cebolla crujiente, queso tierno y salsa sueca.', '2,85 €'),
      menuItem('bocadillo-fiona', 'Fiona', '4,40 €', 'Serrano, majoreno a la plancha, tomate y crema de aguacate.', '2,85 €'),
      menuItem('bocadillo-carol', 'Carol', '4,40 €', 'Pavo, crema de aguacate, tortilla francesa, y queso majoreno.', '2,85 €'),
      menuItem('bocadillo-carla', 'Carla', '4,30 €', 'Masa de pollo, crema de aguacate y queso.', '2,60 €'),
      menuItem('bocadillo-rebeca', 'Rebeca', '4,40 €', 'Pollo, pimiento verde, cebolla y salsa sueca.', '2,85 €'),
      menuItem('bocadillo-jamon-serrano-queso-tierno', 'Jamón serrano y queso tierno', '4,00 €', undefined, '2,30 €'),
      menuItem('bocadillo-jamon-serrano-catalana', 'Jamón serrano catalana', '4,00 €', undefined, '2,30 €'),
      menuItem('bocadillo-jamon-iberico-queso-tierno', 'Jamón ibérico y queso tierno', '5,00 €', undefined, '2,80 €'),
      menuItem('bocadillo-jamon-iberico-catalana', 'Jamón ibérico catalana', '4,60 €', undefined, '2,60 €'),
      menuItem('bocadillo-tortilla-pimientos', 'Tortilla y pimientos verdes', '4,00 €', undefined, '2,30 €'),
      menuItem('bocadillo-pollo-curry', 'Pollo al curry', '4,00 €', 'Pollo al curry, mayonesa, lechuga y tomate.', '2,30 €'),
      menuItem('bocadillo-carne-mechada', 'Carne mechada', '4,00 €', 'Carne mechada, queso gouda y salsa sueca.', '2,30 €'),
      menuItem('bocadillo-lomo-especial', 'Lomo especial', '4,00 €', 'Lomo adobado, lechuga, tomate y zanahoria.', '2,30 €'),
      menuItem('bocadillo-pata-tomate', 'Pata y tomate', '4,00 €', undefined, '2,30 €'),
      menuItem('bocadillo-queso-tierno', 'Queso tierno', '4,00 €', 'Queso tierno, aceite, lechuga, tomate y orégano.', '2,30 €'),
      menuItem('bocadillo-queso-calabacin-miel', 'Queso tierno, calabacín y miel', '4,00 €', undefined, '2,30 €'),
      menuItem('bocadillo-vegetal', 'Vegetal', '4,00 €', 'Lechuga, tomate, millo, atún, zanahoria y mayonesa.', '2,30 €'),
    ],
  },
  {
    id: 'extras-suplementos',
    title: 'Extras y Suplementos',
    note: 'Extras para tus bocadillos y tostadas.',
    image: null,
    alt: '',
    items: [
      menuItem('extra-extras', 'Extras', '1,00 €', 'Lomo, pata, pollo, serrano, atún, queso majoreno, queso tierno, ibérico, crema de aguacate, etc.'),
      menuItem('extra-suplementos', 'Suplementos', '0,50 €', 'Jamón, queso, etc.'),
    ],
  },
  {
    id: 'sandwiches',
    title: 'Sandwiches',
    note: 'Medio y normal. Precio IGIC incluido.',
    image: '/sample-brunch.jpg',
    alt: 'Imagen ilustrativa de sandwiches',
    items: [
      menuItem('sandwich-calabacin-gouda-huevo', 'Calabacín, queso gouda, huevo y salsa sueca', '3,30 €', undefined, '1,70 €'),
      menuItem('sandwich-cangrejo-berros-zanahoria', 'Cangrejos, berros y zanahoria', '3,00 €', undefined, '1,50 €'),
      menuItem('sandwich-pollo-huevo', 'Pollo y huevo', '3,00 €', undefined, '1,50 €'),
      menuItem('sandwich-pollo-huevo-gouda', 'Pollo, huevo y queso gouda', '3,30 €', undefined, '1,70 €'),
      menuItem('sandwich-atun-huevo-gouda', 'Atún, huevo y queso gouda', '3,00 €', undefined, '1,50 €'),
      menuItem('sandwich-atun-huevo-aguacate', 'Atún, huevo y crema de aguacate', '3,30 €', undefined, '1,70 €'),
      menuItem('sandwich-atun-millo', 'Atún y millo', '2,80 €', undefined, '1,50 €'),
      menuItem('sandwich-atun-pimiento', 'Atún y pimiento', '2,80 €', undefined, '1,50 €'),
      menuItem('sandwich-cangrejo', 'Cangrejo', '2,80 €', undefined, '1,50 €'),
      menuItem('sandwich-berros-queso', 'Berros y queso tierno', '3,20 €', undefined, '1,70 €'),
      menuItem('sandwich-jamon-queso', 'Jamón y queso', '2,80 €', undefined, undefined, undefined, ['Normal']),
      menuItem('sandwich-vegetal', 'Vegetal', '3,20 €', undefined, undefined, undefined, ['Normal']),
      menuItem('sandwich-calabacin-queso', 'Calabacín y queso tierno', '3,00 €', undefined, '1,50 €'),
      menuItem('sandwich-especiales', 'Especiales', '3,50 €', undefined, undefined, undefined, ['Normal']),
    ],
  },
  {
    id: 'croissants',
    title: 'Croissant',
    note: 'Precio IGIC incluido.',
    image: '/sample-brunch.jpg',
    alt: 'Imagen ilustrativa de croissants',
    items: [
      menuItem('croissant-vegetal', 'Vegetal', '4,00 €'),
      menuItem('croissant-jamon-queso', 'Jamón y queso', '3,00 €'),
      menuItem('croissant-atun-millo', 'Atún y millo', '3,00 €'),
      menuItem('croissant-tortilla', 'Tortilla', '3,00 €'),
      menuItem('croissant-especiales', 'Especiales', '4,50 €'),
    ],
  },
  {
    id: 'gofres-tortitas',
    title: 'Gofres y Tortitas',
    note: 'Tortitas 6,00 €. Toppings: salsa de caramelo, chocolate, crema de Lotus, crema de cacahuete, chocolate blanco, mermelada, galleta Lotus, pistacho.',
    image: '/sample-brunch.jpg',
    alt: 'Imagen ilustrativa de tortitas',
    items: [
      menuItem('tortitas', 'Tortitas', '6,00 €', 'Elige tu topping: caramelo, chocolate, crema de Lotus, crema de cacahuete, chocolate blanco, mermelada, galleta Lotus o pistacho.'),
    ],
  },
  {
    id: 'crepes',
    title: 'Crepes (Salados y Dulces)',
    note: 'Precio general: 6,00 €.',
    image: '/sample-brunch.jpg',
    alt: 'Imagen ilustrativa de crepes',
    items: [
      menuItem('crepe-mixto', 'Mixto', '6,00 €', 'Jamón y queso.'),
      menuItem('crepe-pizza', 'Pizza', '6,00 €', 'Mozzarella, atún, salsa de tomate, orégano y albahaca.'),
      menuItem('crepe-cacahuete-chocolate', 'Crepe de crema de cacahuete y chocolate', '6,00 €'),
      menuItem('crepe-caramelo', 'Crepe de caramelo', '6,00 €'),
      menuItem('crepe-dulce-leche', 'Crepe de dulce de leche', '6,00 €'),
      menuItem('crepe-chocomix', 'Crepe Chocomix', '6,00 €', 'Chocolate y chocolate blanco.'),
      menuItem('crepe-oreo', 'Crepe Oreo', '6,00 €', 'Chocolate blanco y galletas Oreo.'),
      menuItem('crepe-lotus', 'Crepe Lotus', '6,00 €', 'Crema de Lotus y galletas Lotus.'),
    ],
  },
  {
    id: 'dulces-suplementos',
    title: 'Dulces y Suplementos',
    note: 'Repostería y suplementos dulces.',
    image: '/sample-brunch.jpg',
    alt: 'Imagen ilustrativa de dulces',
    items: [
      menuItem('dulce-tartas-variadas', 'Tartas variadas', '4,00 €'),
      menuItem('dulce-queso-casero', 'Queso casero', '2,50 €'),
      menuItem('dulce-cookies', 'Variedad de Cookies', '2,40 €'),
      menuItem('suplemento-helado', 'Bola de helado', '1,00 €'),
      menuItem('suplemento-nata', 'Nata', '0,50 €'),
    ],
  },
  {
    id: 'cereales',
    title: 'Cereales',
    note: 'Elige tu leche favorita: entera, desnatada, sin lactosa, avena, soja o almendra.',
    image: null,
    alt: '',
    items: [
      menuItem(
        'cereales',
        'Cereales',
        '4,00 €',
        'Tamaños S, M y L.',
        undefined,
        ['Leche entera', 'Leche desnatada', 'Leche sin lactosa', 'Leche de avena', 'Leche de soja', 'Leche de almendra'],
        ['S', 'M', 'L'],
      ),
    ],
  },
  {
    id: 'cafes',
    title: 'Cafés',
    note: 'Precios según carta.',
    image: null,
    alt: '',
    items: [
      menuItem('cafe-biberon', 'Biberón', '1,50 €'),
      menuItem('cafe-biberon-largo', 'Biberón largo', '1,90 €'),
      menuItem('cafe-expreso', 'Expreso', '1,25 €'),
      menuItem('cafe-expreso-doble', 'Expreso doble', '1,75 €'),
      menuItem('cafe-c-doble', 'C. doble', '2,25 €'),
      menuItem('cafe-americano', 'Americano', '1,80 €'),
      menuItem('cafe-hielo', 'Café hielo', '2,10 €'),
      menuItem('cafe-cortado', 'Cortado', '1,40 €'),
      menuItem('cafe-cortado-largo', 'Cortado largo', '1,80 €'),
      menuItem('cafe-capuchino', 'Capuchino', '2,50 €'),
      menuItem('cafe-con-leche', 'Café con leche', '2,00 €'),
      menuItem('cafe-leche-leche-corto', 'Leche y leche corto', '1,50 €'),
      menuItem('cafe-leche-leche-largo', 'Leche y leche largo', '1,90 €'),
      menuItem('cafe-con-leche-tanque', 'Café con leche tanque', '2,70 €'),
      menuItem('cafe-capuchino-tanque', 'Capuchino tanque', '2,80 €'),
      menuItem('cafe-leche-leche-tanque', 'Leche y leche tanque', '2,80 €'),
      menuItem('cafe-colacao', 'ColaCao', '2,30 €'),
      menuItem('cafe-colacao-tanque', 'ColaCao tanque', '2,50 €'),
      menuItem('cafe-vaso-leche', 'Vaso de leche', '1,20 €'),
      menuItem('cafe-chocolate-taza', 'Chocolate a la taza', '2,50 €'),
    ],
  },
  {
    id: 'infusiones',
    title: 'Infusiones',
    note: 'Precios según carta.',
    image: null,
    alt: '',
    items: [
      menuItem('infusion-manzanilla', 'Manzanilla', '2,00 €'),
      menuItem('infusion-menta-poleo', 'Menta Poleo', '2,00 €'),
      menuItem('infusion-frutos-bosque', 'Frutos del bosque', '2,50 €'),
      menuItem('infusion-te-verde-rojo-negro', 'Té verde, rojo, negro', '2,30 €'),
      menuItem('infusion-te-americano', 'Té americano', '2,60 €'),
      menuItem('infusion-te-matcha', 'Té matcha', '4,00 €'),
    ],
  },
  {
    id: 'cafes-especiales',
    title: 'Cafés Especiales',
    note: 'Precios según carta.',
    image: null,
    alt: '',
    items: [
      menuItem('especial-lotus', 'Lotus', '4,50 €', 'Café, crema de leche, crema lotus, galletas lotus.'),
      menuItem('especial-barraquito', 'Barraquito', '4,50 €', 'Café, condensada, licor 43, crema de leche, canela, limón.'),
      menuItem('especial-cafe-carla', 'Café Carla', '4,50 €', 'Café, condensada, bayleis, crema de leche.'),
      menuItem('especial-moka', 'Moka', '4,50 €', 'Café, chocolate, nata.'),
      menuItem('especial-cafe-titi', 'Café Titi', '4,50 €', 'Café, tía María, crema de leche.'),
      menuItem('especial-cafe-caramel', 'Café Caramel', '4,50 €', 'Café, caramelo, crema de leche, nata.'),
      menuItem('especial-chocolate-suizo', 'Chocolate Suizo', '4,50 €'),
    ],
  },
  {
    id: 'suplementos-cafe',
    title: 'Suplementos (Cafés)',
    note: 'Suplementos para cafés especiales.',
    image: null,
    alt: '',
    items: [
      menuItem('suplemento-licores', 'Licores', '0,50 €', 'Licor Tía María, Licor 43, Baileys.'),
      menuItem('suplemento-nata-condensada-leche', 'Nata, Condensada y Leche', '0,30 €'),
      menuItem('suplemento-vegetal-sin-lactosa', 'Bebidas vegetales y sin lactosa', '0,20 €'),
      menuItem('suplemento-canela', 'Canela', '0,20 €'),
    ],
  },
];
