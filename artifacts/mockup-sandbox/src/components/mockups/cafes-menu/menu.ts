export type MenuItem = {
  id: string;
  name: string;
  price?: string;
  description?: string;
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
): MenuItem => ({ id, name, price, description });

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
        '1,50 €',
      ),
      menuItem(
        'moni-featured',
        'Moni',
        '2,20 €',
        'Pollo al curry, aguacate, queso tierno, pavo y tomate.',
      ),
      menuItem('vegetal-featured', 'Vegetal', '2,00 €'),
    ],
  },
  {
    id: 'coffee',
    title: 'Cafés clásicos',
    note: 'Cafés y bebidas calientes que figuran en la carta.',
    image: '/sample-coffee.jpg',
    alt: 'Imagen ilustrativa de una taza de café; no corresponde al local',
    items: [
      menuItem('cafe-tanque-leche', 'Café tanque con leche'),
      menuItem('cafe-tanque-leche-leche', 'Café tanque leche y leche'),
      menuItem('cortado-largo', 'Cortado largo'),
      menuItem('leche-leche-largo', 'Leche y leche largo'),
      menuItem('bibe-largo', 'Bibe largo'),
      menuItem('bibe', 'Bibe'),
      menuItem('leche-leche', 'Leche y leche'),
      menuItem('cortado-corto', 'Cortado corto'),
      menuItem('barraquito', 'Barraquito'),
      menuItem('moka', 'Moka'),
      menuItem('cafe-carla', 'Café Carla', undefined, 'Baileys o Tía María.'),
      menuItem('lotus', 'Lotus'),
      menuItem('sureno', 'Sureño'),
      menuItem('solo', 'Solo'),
      menuItem('doble', 'Doble'),
      menuItem('americano', 'Americano'),
      menuItem('cafe-hielo', 'Café con hielo'),
      menuItem('jarra-leche', 'Jarra de leche'),
      menuItem('jarra-cafe', 'Jarra de café'),
      menuItem('cafe-leche', 'Café con leche'),
      menuItem('capuccino', 'Capuccino'),
      menuItem('vaso-leche', 'Vaso de leche'),
      menuItem('cola-cao', 'Cola Cao'),
      menuItem('chocolate', 'Chocolate'),
      menuItem('suizo', 'Suizo'),
      menuItem('cafe-corto', 'Café corto'),
    ],
  },
  {
    id: 'tea',
    title: 'Tés e infusiones',
    note: 'Esta categoría estaba en la idea inicial, pero no aparece en la carta recibida.',
    image: null,
    alt: '',
    items: [],
    emptyMessage: 'No hay tés ni infusiones detallados en la carta compartida.',
  },
  {
    id: 'baguettes',
    title: 'Bocadillos',
    note: 'Bocadillos con ingredientes y precios transcritos de la carta.',
    image: '/sample-brunch.jpg',
    alt: 'Imagen ilustrativa de comida de cafetería; no corresponde a estos bocadillos',
    items: [
      menuItem(
        'moni',
        'Moni',
        '2,20 €',
        'Pollo al curry, aguacate, queso tierno, pavo y tomate.',
      ),
      menuItem(
        'esther',
        'Esther',
        '2,20 €',
        'Pata, cebolla crujiente, queso tierno y salsa sueca.',
      ),
      menuItem(
        'fiona',
        'Fiona',
        '2,20 €',
        'Serrano, majorero a la plancha, tomate y aguacate.',
      ),
      menuItem(
        'carol',
        'Carol',
        '2,20 €',
        'Pavo, aguacate, tortilla francesa y queso majorero.',
      ),
      menuItem('carla', 'Carla', '2,20 €', 'Masa de pollo, aguacate y queso.'),
      menuItem(
        'rebeca',
        'Rebeca',
        '2,10 €',
        'Pollo, pimiento verde, cebolla y salsa sueca.',
      ),
      menuItem('serrano-queso-tierno', 'Jamón serrano y queso tierno', '2,00 €'),
      menuItem('serrano-catalana', 'Jamón serrano catalana', '2,00 €'),
      menuItem('iberico-queso-tierno', 'Jamón ibérico y queso tierno', '3,00 €'),
      menuItem('iberico-catalana', 'Jamón ibérico catalana', '2,95 €'),
      menuItem('tortilla-pimientos', 'Tortilla y pimientos verdes', '2,20 €'),
      menuItem(
        'pollo-curry',
        'Pollo al curry',
        '2,20 €',
        'Mayonesa, lechuga y tomate.',
      ),
      menuItem(
        'carne-mechada',
        'Carne mechada',
        '2,20 €',
        'Queso gouda y salsa sueca.',
      ),
      menuItem(
        'lomo-especial',
        'Lomo especial',
        '2,20 €',
        'Lomo adobado, lechuga, tomate y zanahoria.',
      ),
      menuItem('pata-tomate', 'Pata y tomate', '2,20 €'),
      menuItem(
        'queso-tierno-ensalada',
        'Queso tierno',
        '2,20 €',
        'Aceite, lechuga, tomate y orégano.',
      ),
      menuItem(
        'queso-calabacin-miel',
        'Queso tierno, calabacín y miel',
        '2,20 €',
      ),
      menuItem(
        'vegetal-bocadillo',
        'Vegetal',
        '2,20 €',
        'Lechuga, tomate, millo, atún, zanahoria y mayonesa.',
      ),
    ],
  },
  {
    id: 'sandwiches',
    title: 'Sandwiches',
    note: 'Opciones de la carta con el precio indicado en el documento.',
    image: '/sample-brunch.jpg',
    alt: 'Imagen ilustrativa de un desayuno; no corresponde a estos sandwiches',
    items: [
      menuItem(
        'sandwich-calabacin-gouda',
        'Calabacín, queso gouda, huevo y salsa sueca',
        '1,50 €',
      ),
      menuItem(
        'sandwich-cangrejo-berros-zanahoria',
        'Cangrejos, berros y zanahoria',
        '1,25 €',
      ),
      menuItem('sandwich-pollo-huevo', 'Pollo y huevo', '1,35 €'),
      menuItem(
        'sandwich-pollo-huevo-gouda',
        'Pollo, huevo y queso gouda',
        '1,50 €',
      ),
      menuItem(
        'sandwich-atun-huevo-gouda',
        'Atún, huevo y queso gouda',
        '1,50 €',
      ),
      menuItem(
        'sandwich-atun-huevo-aguacate',
        'Atún, huevo y aguacate',
        '1,50 €',
      ),
      menuItem('sandwich-atun-millo', 'Atún y millo', '1,25 €'),
      menuItem('sandwich-atun-pimiento', 'Atún y pimiento', '1,25 €'),
      menuItem('sandwich-cangrejo', 'Cangrejo', '1,25 €'),
      menuItem(
        'sandwich-berros-queso',
        'Berros y queso tierno',
        '1,50 €',
      ),
      menuItem('sandwich-jamon-queso', 'Jamón y queso', '2,50 €'),
      menuItem('sandwich-vegetal', 'Vegetal', '3,00 €'),
      menuItem(
        'sandwich-calabacin-queso',
        'Calabacín y queso tierno',
        '1,50 €',
      ),
      menuItem('sandwich-especiales', 'Especiales', '3,50 €'),
    ],
  },
  {
    id: 'croissants',
    title: 'Croissants',
    note: 'Croissants preparados con distintas opciones de relleno.',
    image: '/sample-brunch.jpg',
    alt: 'Imagen ilustrativa de bollería; no corresponde a estos croissants',
    items: [
      menuItem('croissant-vegetal', 'Vegetal', '2,00 €'),
      menuItem('croissant-jamon-queso', 'Jamón y queso', '3,00 €'),
      menuItem('croissant-atun-millo', 'Atún y millo', '3,00 €'),
      menuItem('croissant-tortilla', 'Tortilla', '3,00 €'),
      menuItem('croissant-especiales', 'Especiales', '4,50 €'),
    ],
  },
  {
    id: 'sweets',
    title: 'Dulces',
    note: 'Una selección dulce para acompañar el café o la merienda.',
    image: '/sample-brunch.jpg',
    alt: 'Imagen ilustrativa de repostería; no corresponde a estos dulces',
    items: [
      menuItem('tartas-variadas', 'Tartas variadas', '4,00 €'),
      menuItem('queque-casero', 'Queque casero', '2,50 €'),
      menuItem('cookies-chocolate', 'Cookies con chocolate', '2,20 €'),
    ],
  },
  {
    id: 'savory-crepes',
    title: 'Crepes salados',
    note: 'Crepes salados con los ingredientes descritos en la carta.',
    image: '/sample-brunch.jpg',
    alt: 'Imagen ilustrativa de una merienda; no corresponde a estos crepes',
    items: [
      menuItem('crepe-mixto', 'Mixto', '5,20 €', 'Jamón y queso.'),
      menuItem(
        'crepe-pizza',
        'Crep pizza',
        '5,20 €',
        'Mozzarella, atún, salsa de tomate, orégano y albahaca.',
      ),
    ],
  },
  {
    id: 'sweet-crepes',
    title: 'Crepes dulces',
    note: 'Elige tu combinación dulce favorita.',
    image: '/sample-brunch.jpg',
    alt: 'Imagen ilustrativa de un postre; no corresponde a estos crepes',
    items: [
      menuItem(
        'crepe-cacahuete-chocolate',
        'Crep de crema de cacahuete y chocolate',
        '5,20 €',
      ),
      menuItem('crepe-caramelo', 'Crep de caramelo', '5,20 €'),
      menuItem('crepe-dulce-leche', 'Crep de dulce de leche', '5,20 €'),
      menuItem(
        'crepe-chocomix',
        'Crep Chocomix',
        '5,20 €',
        'Chocolate y chocolate blanco.',
      ),
      menuItem(
        'crepe-oreo',
        'Crep Oreo',
        '5,20 €',
        'Chocolate blanco y galletas Oreo.',
      ),
      menuItem(
        'crepe-lotus',
        'Crep Lotus',
        '5,20 €',
        'Crema de Lotus y galletas Lotus.',
      ),
    ],
  },
  {
    id: 'cereals-bowls',
    title: 'Cereales y boles',
    note: 'Cereales, boles preparados y distintas opciones de leche.',
    image: '/sample-brunch.jpg',
    alt: 'Imagen ilustrativa de un desayuno; no corresponde a estos boles',
    items: [
      menuItem(
        'cereales',
        'Cereales',
        '3,00 €',
        'Tamaños S, M y L. Leche entera, desnatada, sin lactosa, avena, soja o almendra.',
      ),
      menuItem(
        'cookie-monster-bol',
        'Cookie Monster Bol',
        undefined,
        'Chips Ahoy, Oreo O’s, ositos, Koala y Mikado.',
      ),
      menuItem(
        'canela-manzana',
        'Canela-Manzana',
        undefined,
        'Apple Jacks, Cinnamon Toast, granola y sirope de caramelo.',
      ),
      menuItem(
        'choco-cacahuete',
        'Choco-Cacahuete',
        undefined,
        'Reese Puffs, Nutter Butter, Cocoa Puffs, Kinder Bueno y sirope de chocolate.',
      ),
      menuItem(
        'arcoiris',
        'Arcoíris',
        undefined,
        'Froot Loops, Fruity Pebbles, Pink Donut, nata y fideos de colores.',
      ),
      menuItem(
        'oreo-bol',
        'Oreo',
        undefined,
        'Oreo, “oreo galaen”, mini-Oreo y sirope de caramelo.',
      ),
    ],
  },
  {
    id: 'waffles',
    title: 'Gofres',
    note: 'Gofres con el topping que más te apetezca.',
    image: '/sample-brunch.jpg',
    alt: 'Imagen ilustrativa de un dulce; no corresponde a estos gofres',
    items: [
      menuItem(
        'gofres',
        'Gofres',
        '3,90 €',
        'Elige topping: caramelo, chocolate, crema de cacahuete, chocolate blanco, crema Lotus, mermelada o galletas Lotus.',
      ),
    ],
  },
  {
    id: 'pancakes',
    title: 'Tortitas',
    note: 'Tortitas y tortitas americanas con opciones dulces.',
    image: '/sample-brunch.jpg',
    alt: 'Imagen ilustrativa de tortitas; no corresponde a estos productos',
    items: [
      menuItem('tortitas', 'Tortitas', '2,90 €'),
      menuItem(
        'tortitas-americanas',
        'Tortitas americanas',
        undefined,
        'Con salsa de caramelo o chocolate y nata. Bola de helado opcional: suplemento de 1,00 €.',
      ),
    ],
  },
  {
    id: 'extras',
    title: 'Extras',
    note: 'Añadidos y suplementos que aparecen en la carta.',
    image: null,
    alt: '',
    items: [
      menuItem(
        'extras-salados',
        'Extras',
        '1,00 €',
        'Lomo, pata, pollo, serrano, atún, queso majorero, queso tierno, ibérico, entre otros.',
      ),
      menuItem(
        'suplementos',
        'Suplementos',
        '0,50 €',
        'Jamón, queso, entre otros.',
      ),
      menuItem(
        'suplemento-helado',
        'Suplemento de bola de helado',
        '1,00 €',
      ),
      menuItem('suplemento-nata', 'Suplemento de nata'),
      menuItem('topping', 'Topping'),
    ],
  },
];
