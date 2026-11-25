import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type Lang = 'es' | 'en';

interface LanguageContextType {
  lang: Lang;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const DICTIONARY: Record<string, Record<Lang, string>> = {
  // Navegación / header
  'Nuestra esencia': { es: 'Nuestra esencia', en: 'Our essence' },
  'La carta': { es: 'La carta', en: 'The menu' },
  'Visítanos': { es: 'Visítanos', en: 'Visit us' },
  'Hablemos': { es: 'Hablemos', en: "Let's talk" },
  'Volver a la carta': { es: 'Volver a la carta', en: 'Back to menu' },
  'Cerrar sesión': { es: 'Cerrar sesión', en: 'Sign out' },
  'Panel de personal': { es: 'Panel de personal', en: 'Staff panel' },
  'Acceso de personal': { es: 'Acceso de personal', en: 'Staff access' },
  'PANEL INTERNO': { es: 'PANEL INTERNO', en: 'INTERNAL PANEL' },
  'Iniciar sesión': { es: 'Iniciar sesión', en: 'Sign in' },
  'Ups…': { es: 'Ups…', en: 'Oops…' },
  'Información': { es: 'Información', en: 'Information' },

  // Producto / carta
  Añadir: { es: 'Añadir', en: 'Add' },
  Agotado: { es: 'Agotado', en: 'Sold out' },
  'Tamaño:': { es: 'Tamaño:', en: 'Size:' },
  'Cargando la carta...': { es: 'Cargando la carta...', en: 'Loading menu...' },
  'No pudimos cargar la carta': { es: 'No pudimos cargar la carta', en: "We couldn't load the menu" },
  'La carta está vacía en este momento. Vuelve a intentarlo en unos minutos.': {
    es: 'La carta está vacía en este momento. Vuelve a intentarlo en unos minutos.',
    en: 'The menu is empty at the moment. Please try again in a few minutes.',
  },
  'IMAGEN DE MUESTRA': { es: 'IMAGEN DE MUESTRA', en: 'SAMPLE IMAGE' },

  // Carrito / checkout
  'Tu carrito': { es: 'Tu carrito', en: 'Your cart' },
  'TU SELECCIÓN': { es: 'TU SELECCIÓN', en: 'YOUR SELECTION' },
  'Tu carrito todavía está vacío.': { es: 'Tu carrito todavía está vacío.', en: 'Your cart is still empty.' },
  'Seguir pidiendo': { es: 'Seguir pidiendo', en: 'Keep ordering' },
  'Vaciar carrito': { es: 'Vaciar carrito', en: 'Clear cart' },
  'Precio por confirmar': { es: 'Precio por confirmar', en: 'Price to be confirmed' },
  Eliminar: { es: 'Eliminar', en: 'Remove' },
  'Subtotal parcial': { es: 'Subtotal parcial', en: 'Partial subtotal' },
  Subtotal: { es: 'Subtotal', en: 'Subtotal' },
  'El total es parcial: hay productos sin precio indicado en la carta.': {
    es: 'El total es parcial: hay productos sin precio indicado en la carta.',
    en: 'The total is partial: some products have no price indicated in the menu.',
  },
  'He leído y acepto los': { es: 'He leído y acepto los', en: 'I have read and accept the' },
  'Términos y Condiciones': { es: 'Términos y Condiciones', en: 'Terms and Conditions' },
  y: { es: 'y', en: 'and' },
  'Política de Privacidad': { es: 'Política de Privacidad', en: 'Privacy Policy' },
  Reintentar: { es: 'Reintentar', en: 'Retry' },
  'Terminar pedido': { es: 'Terminar pedido', en: 'Complete order' },
  'Pagar con tarjeta': { es: 'Pagar con tarjeta', en: 'Pay by card' },
  'Pagar en Efectivo': { es: 'Pagar en Efectivo', en: 'Pay in cash' },
  'Agregar más a cocina': { es: 'Agregar más a cocina', en: 'Add more to kitchen' },
  'Tu pedido está servido · Puedes pagar ahora': {
    es: 'Tu pedido está servido · Puedes pagar ahora',
    en: 'Your order is served · You can pay now',
  },
  'Pedido anterior pagado ✓ · Puedes seguir pidiendo': {
    es: 'Pedido anterior pagado ✓ · Puedes seguir pidiendo',
    en: 'Previous order paid ✓ · You can keep ordering',
  },
  'Tu pedido ya fue enviado a cocina. Puedes agregar más items.': {
    es: 'Tu pedido ya fue enviado a cocina. Puedes agregar más items.',
    en: 'Your order has already been sent to the kitchen. You can add more items.',
  },
  'Tu pedido anterior está servido · Puedes pagar o agregar más': {
    es: 'Tu pedido anterior está servido · Puedes pagar o agregar más',
    en: 'Your previous order is served · You can pay or add more',
  },
  'Espera a que la cocina marque tu pedido como servido para poder pagar.': {
    es: 'Espera a que la cocina marque tu pedido como servido para poder pagar.',
    en: 'Wait for the kitchen to mark your order as served before you can pay.',
  },
  'Pago en efectivo pendiente.': { es: 'Pago en efectivo pendiente.', en: 'Cash payment pending.' },
  'Tu pedido está listo para pagar.': { es: 'Tu pedido está listo para pagar.', en: 'Your order is ready to pay.' },
  'Tu pedido ya está pagado.': { es: 'Tu pedido ya está pagado.', en: 'Your order is already paid.' },
  'Tu pedido ya fue enviado a cocina.': { es: 'Tu pedido ya fue enviado a cocina.', en: 'Your order has already been sent to the kitchen.' },

  // Landing
  'UN RINCÓN PARA BAJAR EL RITMO': { es: 'UN RINCÓN PARA BAJAR EL RITMO', en: 'A CORNER TO SLOW DOWN' },
  'Huele.': { es: 'Huele.', en: 'Smell.' },
  'Saborea.': { es: 'Saborea.', en: 'Taste.' },
  'Disfruta.': { es: 'Disfruta.', en: 'Enjoy.' },
  'Un café preparado con cariño. Un ratito para ti. En Cafés de Carla, cada pausa merece saborearse.': {
    es: 'Un café preparado con cariño. Un ratito para ti. En Cafés de Carla, cada pausa merece saborearse.',
    en: 'A coffee prepared with care. A little moment for you. At Cafés de Carla, every pause deserves to be savored.',
  },
  'Descubre la carta': { es: 'Descubre la carta', en: 'Discover the menu' },
  'Imagen de muestra, no fotografía del local: café servido en cerámica bajo luz natural': {
    es: 'Imagen de muestra, no fotografía del local: café servido en cerámica bajo luz natural',
    en: 'Sample image, not a photo of the premises: coffee served in ceramic under natural light',
  },
  'un momento para ti': { es: 'un momento para ti', en: 'a moment for you' },
  'Tomarse el tiempo también sabe.': { es: 'Tomarse el tiempo también sabe.', en: 'Taking your time also tastes good.' },
  'Huele · Saborea · Disfruta': { es: 'Huele · Saborea · Disfruta', en: 'Smell · Taste · Enjoy' },
  'Huele, Saborea, Disfruta.': { es: 'Huele, Saborea, Disfruta.', en: 'Smell, Taste, Enjoy.' },
  '01 / NUESTRA ESENCIA': { es: '01 / NUESTRA ESENCIA', en: '01 / OUR ESSENCE' },
  'Hay dias que piden una pausa bonita.': { es: 'Hay dias que piden una pausa bonita.', en: 'Some days call for a beautiful pause.' },
  'En Cafes de Carla creemos en el placer sencillo de parar un momento. En el aroma que llega antes del primer sorbo, en algo rico sobre la mesa y en sentirte bien recibido.': {
    es: 'En Cafes de Carla creemos en el placer sencillo de parar un momento. En el aroma que llega antes del primer sorbo, en algo rico sobre la mesa y en sentirte bien recibido.',
    en: 'At Cafés de Carla, we believe in the simple pleasure of stopping for a moment. In the aroma that arrives before the first sip, in something delicious on the table, and in making you feel welcome.',
  },
  'despacio sabe mejor': { es: 'despacio sabe mejor', en: 'slowly tastes better' },
  '02 / PARA DISFRUTAR': { es: '02 / PARA DISFRUTAR', en: '02 / TO ENJOY' },
  'Algo rico, en buena compañía.': { es: 'Algo rico, en buena compañía.', en: 'Something delicious, in good company.' },
  'Nuestra carta se actualiza desde la base de datos: productos, precios, tamaños y disponibilidad en tiempo real.': {
    es: 'Nuestra carta se actualiza desde la base de datos: productos, precios, tamaños y disponibilidad en tiempo real.',
    en: 'Our menu updates from the database: products, prices, sizes, and availability in real-time.',
  },
  'EN LA CARTA': { es: 'EN LA CARTA', en: 'ON THE MENU' },
  'Precios y disponibilidad actualizados desde la base de datos. Las fotos son ilustrativas.': {
    es: 'Precios y disponibilidad actualizados desde la base de datos. Las fotos son ilustrativas.',
    en: 'Prices and availability updated from the database. Photos are illustrative.',
  },
  'EL PLACER DE HACER UNA COSA A LA VEZ': { es: 'EL PLACER DE HACER UNA COSA A LA VEZ', en: 'THE PLEASURE OF DOING ONE THING AT A TIME' },
  '03 / CUANDO QUIERAS': { es: '03 / CUANDO QUIERAS', en: '03 / WHENEVER YOU WANT' },
  'La mesa está servida.': { es: 'La mesa está servida.', en: 'The table is set.' },
  'Encuéntranos en el Centro Comercial Las Arenas, en Las Palmas de Gran Canaria. Te esperamos con el café recién hecho.': {
    es: 'Encuéntranos en el Centro Comercial Las Arenas, en Las Palmas de Gran Canaria. Te esperamos con el café recién hecho.',
    en: 'Find us at the Las Arenas Shopping Center, in Las Palmas de Gran Canaria. We wait for you with freshly made coffee.',
  },
  'Abrir en Google Maps': { es: 'Abrir en Google Maps', en: 'Open in Google Maps' },
  'DÓNDE ENCONTRARNOS': { es: 'DÓNDE ENCONTRARNOS', en: 'WHERE TO FIND US' },
  'Dirección': { es: 'Dirección', en: 'Address' },
  'PARA TU PRÓXIMA PAUSA': { es: 'PARA TU PRÓXIMA PAUSA', en: 'FOR YOUR NEXT BREAK' },
  'Horario': { es: 'Horario', en: 'Opening hours' },
  'ESTAMOS AQUÍ PARA AYUDAR': { es: 'ESTAMOS AQUÍ PARA AYUDAR', en: 'WE ARE HERE TO HELP' },
  'Si tienes cualquier duda, llámanos o escríbenos y te atenderemos encantados.': {
    es: 'Si tienes cualquier duda, llámanos o escríbenos y te atenderemos encantados.',
    en: 'If you have any questions, call us or write to us and we will be happy to help.',
  },
  'También puedes ver la ubicación exacta en el mapa.': {
    es: 'También puedes ver la ubicación exacta en el mapa.',
    en: 'You can also see the exact location on the map.',
  },
  '04 / UN POQUITO MÁS CERCA': { es: '04 / UN POQUITO MÁS CERCA', en: '04 / A LITTLE CLOSER' },
  'Lo que pasa': { es: 'Lo que pasa', en: 'What happens' },
  'al otro lado.': { es: 'al otro lado.', en: 'on the other side.' },
  'Pronto podrás asomarte a nuestro día a día.': {
    es: 'Pronto podrás asomarte a nuestro día a día.',
    en: 'Soon you will be able to look into our daily life.',
  },
  'Cuenta de Instagram — Confirmación próxima': { es: 'Cuenta de Instagram — Confirmación próxima', en: 'Instagram account — Confirmation pending' },
  'El feed aparecerá aquí': { es: 'El feed aparecerá aquí', en: 'The feed will appear here' },
  'cuando tengamos la cuenta': { es: 'cuando tengamos la cuenta', en: 'when we have the account' },
  'Aviso legal': { es: 'Aviso legal', en: 'Legal notice' },
  'Privacidad': { es: 'Privacidad', en: 'Privacy' },
  'Cookies': { es: 'Cookies', en: 'Cookies' },
  'Volver arriba': { es: 'Volver arriba', en: 'Back to top' },
  'Hecho para disfrutar sin prisa.': { es: 'Hecho para disfrutar sin prisa.', en: 'Made to be enjoyed without haste.' },

  // Admin
  'Panel de Administración': { es: 'Panel de Administración', en: 'Administration Panel' },
  'Gestiona la disponibilidad de los productos en Neon. Los cambios se reflejan en la carta y en el checkout.': {
    es: 'Gestiona la disponibilidad de los productos en Neon. Los cambios se reflejan en la carta y en el checkout.',
    en: 'Manage product availability in Neon. Changes are reflected in the menu and checkout.',
  },
  DISPONIBILIDAD: { es: 'DISPONIBILIDAD', en: 'AVAILABILITY' },
  'EDITAR CARTA': { es: 'EDITAR CARTA', en: 'EDIT MENU' },
  TODOS: { es: 'TODOS', en: 'ALL' },
  DISPONIBLES: { es: 'DISPONIBLES', en: 'AVAILABLE' },
  AGOTADOS: { es: 'AGOTADOS', en: 'SOLD OUT' },
  'No hay productos en la base de datos': { es: 'No hay productos en la base de datos', en: 'No products in the database' },
  Agregar: { es: 'Agregar', en: 'Add' },
  Producto: { es: 'Producto', en: 'Product' },
  Productos: { es: 'Productos', en: 'Products' },
  Editar: { es: 'Editar', en: 'Edit' },
  'Guardar cambios': { es: 'Guardar cambios', en: 'Save changes' },
  Cancelar: { es: 'Cancelar', en: 'Cancel' },
  Nombre: { es: 'Nombre', en: 'Name' },
  Categoría: { es: 'Categoría', en: 'Category' },
  Descripción: { es: 'Descripción', en: 'Description' },
  'URL de imagen': { es: 'URL de imagen', en: 'Image URL' },
  'Subir foto': { es: 'Subir foto', en: 'Upload photo' },
  'Subiendo...': { es: 'Subiendo...', en: 'Uploading...' },
  Lista: { es: 'Lista', en: 'Ready' },
  'Agotado / No disponible': { es: 'Agotado / No disponible', en: 'Out of stock / Unavailable' },
  AGOTADO: { es: 'AGOTADO', en: 'SOLD OUT' },
  DISPONIBLE: { es: 'DISPONIBLE', en: 'AVAILABLE' },
  'Marcar como Agotado': { es: 'Marcar como Agotado', en: 'Mark as Sold out' },
  'Marcar Disponible': { es: 'Marcar Disponible', en: 'Mark as Available' },
  'Producto marcado como agotado': { es: 'Producto marcado como agotado', en: 'Product marked as sold out' },
  'Producto disponible nuevamente': { es: 'Producto disponible nuevamente', en: 'Product available again' },
  'Error al actualizar estado': { es: 'Error al actualizar estado', en: 'Error updating status' },
  'Precio Normal': { es: 'Precio Normal', en: 'Regular price' },
  'Precio Mini': { es: 'Precio Mini', en: 'Small price' },
  'Precio Grande': { es: 'Precio Grande', en: 'Large price' },
  'Agregar Producto': { es: '+ Agregar Producto', en: '+ Add Product' },
  'Agregar producto': { es: 'Agregar producto', en: 'Add product' },
  'Editar producto': { es: 'Editar producto', en: 'Edit product' },
  'Cargando administración...': { es: 'Cargando administración...', en: 'Loading administration...' },
  'Error cargando productos': { es: 'Error cargando productos', en: 'Error loading products' },
  'La sesión ha caducado. Vuelve a entrar.': {
    es: 'La sesión ha caducado. Vuelve a entrar.',
    en: 'Your session has expired. Please sign in again.',
  },
  'Accede con tu cuenta de personal para entrar al panel correspondiente.': {
    es: 'Accede con tu cuenta de personal para entrar al panel correspondiente.',
    en: 'Sign in with your staff account to access the corresponding panel.',
  },
  'Nombre (EN)': { es: 'Nombre (EN)', en: 'Name (EN)' },
  'Descripción (EN)': { es: 'Descripción (EN)', en: 'Description (EN)' },
  'Categoría (EN)': { es: 'Categoría (EN)', en: 'Category (EN)' },

  // Cart / table / checkout extra
  'Puedes seguir agregando más productos o completar el pago.': {
    es: 'Puedes seguir agregando más productos o completar el pago.',
    en: 'You can keep adding more products or complete the payment.',
  },
  'Estado': { es: 'Estado', en: 'Status' },
  'Pendiente': { es: 'Pendiente', en: 'Pending' },
  'Confirmado': { es: 'Confirmado', en: 'Confirmed' },
  'Servido': { es: 'Servido', en: 'Served' },
  'Pagado': { es: 'Pagado', en: 'Paid' },
  'Items en cocina': { es: 'Items en cocina', en: 'Kitchen items' },
  'Total cocina': { es: 'Total cocina', en: 'Kitchen total' },
  'Pago en efectivo pendiente': { es: 'Pago en efectivo pendiente', en: 'Pending cash payment' },
  'Avisa al camarero de que vas a pagar en efectivo.': {
    es: 'Avisa al camarero de que vas a pagar en efectivo.',
    en: 'Let the waiter know you are going to pay in cash.',
  },
  'El camarero marcará la mesa como cobrada desde el panel de cocina.': {
    es: 'El camarero marcará la mesa como cobrada desde el panel de cocina.',
    en: 'The waiter will mark the table as paid from the kitchen panel.',
  },
  'MESA': { es: 'MESA', en: 'TABLE' },
  'Estás en el local · Pide lo que quieras y paga al final': {
    es: 'Estás en el local · Pide lo que quieras y paga al final',
    en: 'You are in the restaurant · Order what you want and pay at the end',
  },
  'No se ha detectado una mesa activa.': { es: 'No se ha detectado una mesa activa.', en: 'No active table detected.' },
  '¡Pedido enviado a cocina!': { es: '¡Pedido enviado a cocina!', en: 'Order sent to kitchen!' },

  // Cookies
  'Usamos cookies para cuidar tu experiencia': { es: 'Usamos cookies para cuidar tu experiencia', en: 'We use cookies to improve your experience' },
  'Las cookies necesarias guardan tu carrito y tus preferencias. Con tu permiso, podríamos usar cookies de análisis para mejorar la web. Tú decides.': {
    es: 'Las cookies necesarias guardan tu carrito y tus preferencias. Con tu permiso, podríamos usar cookies de análisis para mejorar la web. Tú decides.',
    en: 'Necessary cookies ensure your cart and preferences. With your permission, we may use analytics cookies to improve the website. You decide.',
  },
  'Rechazar no necesarias': { es: 'Rechazar no necesarias', en: 'Reject non-essential' },
  'Aceptar todas': { es: 'Aceptar todas', en: 'Accept all' },

  // Success
  'Pago completado': { es: 'Pago completado', en: 'Payment completed' },
  '¡Marchando': { es: '¡Marchando', en: 'Coming right up' },
  'un americanito': { es: 'un americanito', en: 'an americano' },
  'Tu compra de prueba se ha confirmado. Gracias por pasarte por': {
    es: 'Tu compra de prueba se ha confirmado. Gracias por pasarte por',
    en: 'Your test purchase has been confirmed. Thanks for stopping by',
  },
  'Volver a la cafetería': { es: 'Volver a la cafetería', en: 'Back to the cafe' },
  'Este recibo corresponde a una compra en modo de prueba.': {
    es: 'Este recibo corresponde a una compra en modo de prueba.',
    en: 'This receipt corresponds to a test mode purchase.',
  },
  'unidad': { es: 'unidad', en: 'item' },
  'unidades': { es: 'unidades', en: 'items' },
  'Total': { es: 'Total', en: 'Total' },

  // Modals / cocina
  'Confirmar cobro': { es: 'Confirmar cobro', en: 'Confirm payment' },
  'Esta acción eliminará la mesa del panel.': { es: 'Esta acción eliminará la mesa del panel.', en: 'This action will remove the table from the panel.' },
  'Sí, marcar como cobrado': { es: 'Sí, marcar como cobrado', en: 'Yes, mark as paid' },
  'Sí, cerrar mesa': { es: 'Sí, cerrar mesa', en: 'Yes, close table' },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('es');

  useEffect(() => {
    const stored = localStorage.getItem('cafes_de_carla_lang') as Lang | null;
    if (stored === 'es' || stored === 'en') {
      setLang(stored);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLang((prev) => {
      const next: Lang = prev === 'es' ? 'en' : 'es';
      localStorage.setItem('cafes_de_carla_lang', next);
      return next;
    });
  }, []);

  const t = useCallback(
    (key: string): string => {
      return DICTIONARY[key]?.[lang] ?? key;
    },
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}

export default LanguageContext;
