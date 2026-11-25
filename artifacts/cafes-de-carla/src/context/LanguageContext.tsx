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
  'Nuestra esencia': { es: 'Nuestra esencia', en: 'Our story' },
  'La carta': { es: 'La carta', en: 'The menu' },
  'Visítanos': { es: 'Visítanos', en: 'Visit us' },
  'Hablemos': { es: 'Hablemos', en: 'Contact us' },
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
