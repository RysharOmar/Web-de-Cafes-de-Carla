import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import CafesDeCarlaPreloader from '@/components/page-loader';
import { ArrowDown, ArrowRight, ArrowUpRight, Banknote, ChevronLeft, ChevronRight, Clock3, CreditCard, Instagram, MapPin, Menu as MenuIcon, Minus, Phone, Plus, ShoppingBag, X } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import NotificationModal, { type NotificationVariant } from '@/components/ui/notification-modal';
import CookieBanner from '@/components/cookie-banner';
import ThemeToggle from '@/components/theme-toggle';
import LangToggle from '@/components/lang-toggle';
import FloatingCartButton from '@/components/floating-cart-button';
import LegalLinks from '@/components/legal-links';
import LegalPage from '@/pages/legal';
import Login from '@/pages/Login';
import AccessDenied from '@/pages/access-denied';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AuthProvider } from '@/context/AuthContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Success from '@/pages/success';
import Cocina from '@/pages/cocina';
import Admin from '@/pages/admin';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  displaySizeLabel,
  groupProductos,
  priceForLine,
  type ApiProducto,
  type MenuItem,
} from '@/lib/products';
import { useLanguage } from '@/context/LanguageContext';

const queryClient = new QueryClient();
const logo = '/cafes-de-carla-logo.jpg';
let initialPreloaderDone = false;

// Global types
declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

function trackCartAdd(itemId: string, categoryId: string) {
  if (typeof window === 'undefined' || !Array.isArray(window.dataLayer)) return;
  try {
    window.dataLayer.push({
      event: 'add_to_cart',
      ecommerce: { items: [{ item_id: itemId, item_category: categoryId }] },
    });
  } catch {
    // Analytics must never interrupt the cart interaction.
  }
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

// Product card: image, description, sizes and availability all come from Neon.
function ProductCard({ item, onAdd, count }: { item: MenuItem; onAdd: (size: string, variant: string | null) => void; count: number }) {
  const { t, lang } = useLanguage();
  const [selectedSize, setSelectedSize] = useState(item.defaultSize);
  const [imageFailed, setImageFailed] = useState(false);

  const hasSizes = item.sizes.length > 1;
  const usingFallback = !item.imageUrl || imageFailed;
  const rawImageSrc = usingFallback ? '/sample-brunch.jpg' : item.imageUrl!;
  const cloudinaryTransform = 'c_pad,w_600,h_600,b_white,q_auto,f_auto';
  const imageSrc =
    rawImageSrc.includes('res.cloudinary.com') && rawImageSrc.includes('/upload/') && !rawImageSrc.includes(cloudinaryTransform)
      ? rawImageSrc.replace('/upload/', `/upload/${cloudinaryTransform}/`)
      : rawImageSrc;
  const selectedSizeOption = item.sizes.find((size) => size.label === selectedSize) ?? item.sizes[0];
  const cardSizeStyle =
    count === 1
      ? { flex: '0 1 460px', maxWidth: '480px' }
      : count === 2
        ? { flex: '0 1 380px', maxWidth: '420px' }
        : undefined;

  return (
    <li className={`product-card group${item.agotado ? ' is-sold-out' : ''}`} style={cardSizeStyle} data-testid={`item-menu-${item.id}`}>
      <div className="product-photo p-3">
        <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-white dark:bg-stone-800 shadow-sm transition-shadow duration-500 group-hover:shadow-md">
          <img
            src={imageSrc}
            alt={usingFallback ? `Imagen de muestra de ${item.name}` : item.name}
            loading="lazy"
            decoding="async"
            width="600"
            height="600"
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageFailed(true)}
            data-testid={`img-product-${item.id}`}
          />
          {usingFallback && <span className="product-photo-label">IMAGEN DE MUESTRA</span>}
        </div>
      </div>
      <div className="product-card-content">
        <h4 data-testid={`name-menu-${item.id}`}>{item.name}</h4>
        {item.agotado && <span className="product-card-unavailable">AGOTADO</span>}
        {item.description && <p data-testid={`description-menu-${item.id}`}>{item.description}</p>}

        {hasSizes && (
          <div className="variant-selector" data-testid={`size-selector-${item.id}`}>
            <label>{t('Tamaño:')}</label>
            <div className="variant-options">
              {item.sizes.map((size) => (
                <button
                  key={size.label}
                  type="button"
                  className={`variant-btn ${selectedSize === size.label ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size.label)}
                  data-testid={`size-${item.id}-${size.label}`}
                  disabled={item.agotado}
                >
                  {displaySizeLabel(item.category, size.label, lang)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="product-card-footer">
          <span className="product-card-price" data-testid={`price-menu-${item.id}`}>
            {formatPrice(selectedSizeOption?.priceCents ?? 0)}
          </span>
          <button
            className="add-to-cart focus-ring"
            type="button"
            aria-label={`Añadir ${item.name} al carrito`}
            onClick={() => onAdd(selectedSize, item.defaultVariant ?? null)}
            data-testid={`button-add-menu-${item.id}`}
            disabled={item.agotado}
          >
            <Plus size={15} aria-hidden="true" />
            <span>{item.agotado ? t('Agotado') : t('Añadir')}</span>
          </button>
        </div>
      </div>
    </li>
  );
}

function Home() {
  const [activeCategory, setActiveCategory] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<Record<string, { itemId: string; quantity: number; sizeLabel: string; variant: string | null; nameEs?: string }>>({});
  const [productos, setProductos] = useState<ApiProducto[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [preloaderVisible, setPreloaderVisible] = useState(!initialPreloaderDone);
  const [preloaderFading, setPreloaderFading] = useState(false);
  const wasPreloaderVisibleRef = useRef(!initialPreloaderDone);
  const { lang, t, isLangSwitching } = useLanguage();

  useLayoutEffect(() => {
    if (preloaderVisible) {
      document.documentElement.dataset.appPreloader = '1';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.overscrollBehavior = 'none';
      wasPreloaderVisibleRef.current = true;
    } else if (!isLangSwitching) {
      delete document.documentElement.dataset.appPreloader;
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.overscrollBehavior = '';
      if (wasPreloaderVisibleRef.current) {
        wasPreloaderVisibleRef.current = false;
      }
    } else {
      delete document.documentElement.dataset.appPreloader;
    }
    return () => {
      delete document.documentElement.dataset.appPreloader;
      if (!isLangSwitching) {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.overscrollBehavior = '';
      }
    };
  }, [preloaderVisible, isLangSwitching]);
  const lastMenuFetchRef = useRef(0);
  const hasLoadedMenuRef = useRef(false);

  const menuCategories = useMemo(() => groupProductos(productos, lang), [
    productos,
    lang,
  ]);
  const menuItemsById = useMemo(
    () => new Map(menuCategories.flatMap((category) => category.items).map((item) => [item.id, item] as const)),
    [menuCategories],
  );
  const menuItemCategoryById = useMemo(
    () => new Map(menuCategories.flatMap((category) => category.items.map((item) => [item.id, category.id] as const))),
    [menuCategories],
  );

  const selected = menuCategories.find((category) => category.id === activeCategory) ?? menuCategories[0];
  const prevCategoryRef = useRef('');
  useEffect(() => {
    if (!selected?.id) return;
    if (prevCategoryRef.current && prevCategoryRef.current !== selected.id) {
      const panel = document.getElementById('category-panel');
      if (panel) {
        const target = panel.getBoundingClientRect().top + window.scrollY - 84;
        const start = window.scrollY;
        const distance = target - start;
        const duration = Math.min(550, Math.max(320, Math.abs(distance) * 0.3));
        let startTime: number | null = null;
        const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
        const step = (ts: number) => {
          if (startTime === null) startTime = ts;
          const elapsed = ts - startTime;
          const progress = Math.min(elapsed / duration, 1);
          window.scrollTo(0, start + distance * easeInOutCubic(progress));
          if (elapsed < duration) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }
    prevCategoryRef.current = selected.id;
  }, [selected?.id]);
  const cartTriggerRef = useRef<HTMLButtonElement>(null);
  const cartCloseRef = useRef<HTMLButtonElement>(null);
  const categoryListRef = useRef<HTMLDivElement>(null);
  const categoryDrag = useRef({ down: false, startX: 0, startY: 0, scrollLeft: 0, moved: false, pid: 0 });
  const [catCanLeft, setCatCanLeft] = useState(false);
  const [catCanRight, setCatCanRight] = useState(false);

  const updateCategoryScroll = () => {
    const el = categoryListRef.current;
    if (!el) return;
    setCatCanLeft(el.scrollLeft > 4);
    setCatCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = categoryListRef.current;
    if (!el) return;
    updateCategoryScroll();
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      if (el.scrollWidth <= el.clientWidth) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    const onScroll = () => updateCategoryScroll();
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [menuCategories.length]);

  const onCategoryPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const el = categoryListRef.current;
    if (!el) return;
    categoryDrag.current = { down: true, startX: e.clientX, startY: e.clientY, scrollLeft: el.scrollLeft, moved: false, pid: e.pointerId };
    el.classList.add('is-dragging');

    const onMove = (ev: PointerEvent) => {
      const d = categoryDrag.current;
      const list = categoryListRef.current;
      if (!d.down || !list || d.pid !== ev.pointerId) return;
      const dx = ev.clientX - d.startX;
      const dy = ev.clientY - d.startY;
      if (!d.moved && Math.abs(dx) > 5 && Math.abs(dx) >= Math.abs(dy)) d.moved = true;
      if (d.moved) list.scrollLeft = d.scrollLeft - dx;
    };
    const onUp = (ev: PointerEvent) => {
      const d = categoryDrag.current;
      if (d.pid !== ev.pointerId) return;
      d.down = false;
      categoryListRef.current?.classList.remove('is-dragging');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      if (d.moved) setTimeout(() => { d.moved = false; }, 0);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };
  const onCategoryClickCapture = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (categoryDrag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      categoryDrag.current.moved = false;
    }
  };
  const scrollCategoriesBy = (dir: number) => {
    categoryListRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };
  const cartDrawerRef = useRef<HTMLElement>(null);

  const searchParams = new URLSearchParams(window.location.search);
  const mesaActiva = searchParams.get('mesa'); // ej: "5" o null

  const STORAGE_KEY = 'cafes_de_carla_orders';

  const loadMenu = async (silent = false) => {
    // Las actualizaciones en segundo plano no muestran la pantalla de carga
    // ni se repiten si acaban de ejecutarse (focus + visibilitychange + poll).
    if (silent && (!hasLoadedMenuRef.current || Date.now() - lastMenuFetchRef.current < 3000)) {
      return;
    }

    lastMenuFetchRef.current = Date.now();
    const isInitialPreload = !silent && !initialPreloaderDone;
    const startedAt = Date.now();

    if (!silent) {
      setMenuLoading(true);
      setMenuError(null);
    }

    try {
      const response = await fetch('/api/products', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Error ${response.status} al cargar la carta`);
      }
      const data = await response.json();
      setProductos(Array.isArray(data.productos) ? data.productos : []);
      setMenuError(null);
      hasLoadedMenuRef.current = true;
    } catch (err) {
      console.error('Error cargando la carta:', err);
      if (!silent) {
        setMenuError(err instanceof Error ? err.message : 'No se pudo cargar la carta');
      }
    } finally {
      if (isInitialPreload) {
        const remaining = Math.max(0, 5500 - (Date.now() - startedAt));
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }
        initialPreloaderDone = true;
        setMenuLoading(false);
        setPreloaderFading(true);
        window.setTimeout(() => {
          setPreloaderVisible(false);
        }, 500);
      } else if (!silent) {
        setMenuLoading(false);
      }
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  // Mantiene el estado de agotado al día al volver a la pestaña y cada 30 s.
  useEffect(() => {
    const refreshMenu = () => {
      if (document.visibilityState === 'visible') {
        loadMenu(true);
      }
    };

    window.addEventListener('focus', refreshMenu);
    document.addEventListener('visibilitychange', refreshMenu);
    const intervalId = window.setInterval(refreshMenu, 30000);

    return () => {
      window.removeEventListener('focus', refreshMenu);
      document.removeEventListener('visibilitychange', refreshMenu);
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (menuCategories.length === 0) return;
    if (!menuCategories.some((category) => category.id === activeCategory)) {
      setActiveCategory(menuCategories[0].id);
    }
  }, [menuCategories, activeCategory]);

  // Estado para rastrear el pedido de la mesa (modo local)
  const [orderStatus, setOrderStatus] = useState<'pending' | 'confirmed' | 'served' | 'paid' | null>(null);
  const [orderItemsFromStorage, setOrderItemsFromStorage] = useState<{ id: string; name: string; quantity: number; sizeLabel: string; variant?: string | null; priceCents: number }[]>([]);
  const [cashPending, setCashPending] = useState(false);
  const [notice, setNotice] = useState<{ title: string; message?: string; variant: NotificationVariant } | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const showNotice = (title: string, message?: string, variant: NotificationVariant = 'info') => {
    setNotice({ title, message, variant });
  };

  async function fetchOrderStatus() {
    if (!mesaActiva) {
      setCashPending(false);
      return;
    }
    try {
      // Leer pedidos desde localStorage (compartido con la cocina)
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setCashPending(false);
        return;
      }
      const allOrders = JSON.parse(raw);
      if (!Array.isArray(allOrders) || allOrders.length === 0) {
        setCashPending(false);
        return;
      }

      // Filtrar pedidos de esta mesa
      const mesaOrders = allOrders.filter((o: any) => o.table === mesaActiva);
      if (mesaOrders.length === 0) {
        setCashPending(false);
        return;
      }

      // Tomar solo pedidos NO pagados para mostrar estado
      const unpaidOrders = mesaOrders.filter((o: any) => o.status !== 'paid');

      if (unpaidOrders.length === 0) {
        setOrderStatus('paid');
        setOrderItemsFromStorage([]);
        setCashPending(false);
        return;
      }

      setCashPending(unpaidOrders.some((o: any) => o.pagoPendienteEfectivo === true));
      const latestOrder = unpaidOrders[unpaidOrders.length - 1];
      setOrderStatus(latestOrder.status as 'pending' | 'confirmed' | 'served');
      const unpaidItems = unpaidOrders.flatMap((o: any) => o.items || []);
      setOrderItemsFromStorage(unpaidItems);
    } catch (err) {
      console.error('Error fetching order status:', err);
    }
  }

  const cartLines = Object.values(cart);
  const cartCount = cartLines.reduce((total, line) => total + line.quantity, 0);
  const cartSubtotal = cartLines.reduce((total, line) => {
    const item = menuItemsById.get(line.itemId);
    return total + priceForLine(item, line.sizeLabel) * line.quantity;
  }, 0);

  // Total de la mesa: carrito local + items de pedidos no pagados.
  // Se deriva del estado que ya refresca `fetchOrderStatus`, así al cobrar
  // la mesa el subtotal vuelve a cero inmediatamente.
  const tableTotalCents = useMemo(() => {
    if (!mesaActiva) return cartSubtotal;
    const kitchenTotal = orderItemsFromStorage.reduce(
      (sum, item) => sum + item.priceCents * item.quantity,
      0
    );
    return cartSubtotal + kitchenTotal;
  }, [cartSubtotal, mesaActiva, orderItemsFromStorage]);

  const hasUnpricedLines = cartLines.some((line) => {
    const item = menuItemsById.get(line.itemId);
    return priceForLine(item, line.sizeLabel) <= 0;
  });
  const allPriced = cartLines.length > 0 && !hasUnpricedLines;

  const closeNav = () => setMobileOpen(false);
  const cartKey = (itemId: string, sizeLabel: string) => `${itemId}|${sizeLabel}`;

  const changeCartQuantity = (itemId: string, sizeLabel: string, adjustment: number, variant: string | null = null) => {
    const categoryId = menuItemCategoryById.get(itemId);
    const item = menuItemsById.get(itemId);
    if (adjustment > 0 && categoryId) trackCartAdd(itemId, categoryId);
    setCartOpen(true);

    setCart((current) => {
      const key = cartKey(itemId, sizeLabel);
      const next = { ...current };
      const existing = next[key];
      const quantity = existing ? existing.quantity + adjustment : adjustment;
      if (quantity <= 0) {
        delete next[key];
      } else {
        next[key] = {
          itemId,
          quantity,
          sizeLabel,
          variant: existing?.variant ?? variant ?? null,
          nameEs: existing?.nameEs ?? item?.nameEs ?? undefined,
        };
      }
      return next;
    });
  };

  const setVariantForItem = (itemId: string, sizeLabel: string, variant: string | null) => {
    setCart((current) => {
      const key = cartKey(itemId, sizeLabel);
      const next = { ...current };
      if (next[key]) {
        next[key] = { ...next[key], variant };
      }
      return next;
    });
  };

  const removeFromCart = (itemId: string, sizeLabel: string) => {
    setCart((current) => {
      const next = { ...current };
      delete next[cartKey(itemId, sizeLabel)];
      return next;
    });
  };

  const checkout = async () => {
    if (!allPriced) return;

    try {
      const items = cartLines.map((line) => ({
        id: line.itemId,
        quantity: line.quantity,
        sizeLabel: line.sizeLabel,
        variant: line.variant ?? undefined,
      }));

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, tipo: 'delivery' }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Error al crear la sesión de pago");
      }

      const cartSummary = cartLines.map((line) => {
        const item = menuItemsById.get(line.itemId);
        return {
          name: line.nameEs ?? item?.nameEs ?? line.itemId,
          category: item?.categoryEs ?? item?.category ?? '',
          qty: line.quantity,
          sizeLabel: line.sizeLabel,
          variant: line.variant ?? undefined,
          priceCents: priceForLine(item, line.sizeLabel),
        };
      });
      localStorage.setItem('cart_success', JSON.stringify(cartSummary));

      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      showNotice("No se pudo preparar el pago", "Inténtalo de nuevo.\n\nDetalle: " + msg, "error");
    }
  };

  // --- Funciones para modo "En el local" (mesa) ---

  const sendToKitchen = async () => {
    if (!mesaActiva) {
      showNotice("No se ha detectado una mesa activa.", undefined, "error");
      return;
    }
    if (!allPriced) return;

    try {
      const items = cartLines.map((line) => {
        const item = menuItemsById.get(line.itemId);
        const price = priceForLine(item, line.sizeLabel);
        return {
          id: line.itemId,
          // En cocina se muestra siempre el nombre base en español para evitar confusiones.
          name: line.nameEs ?? item?.nameEs ?? line.itemId,
          quantity: line.quantity,
          sizeLabel: line.sizeLabel,
          variant: line.variant ?? undefined,
          priceCents: price,
        };
      });

      const totalCents = items.reduce((sum, it) => sum + it.priceCents * it.quantity, 0);

      const now = new Date().toISOString();
      const newOrder: any = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        table: mesaActiva,
        items,
        totalCents,
        status: 'pending',
        createdAt: now,
      };

      // Guardar en localStorage compartido con la cocina
      const existing = localStorage.getItem(STORAGE_KEY);
      const allOrders = existing ? JSON.parse(existing) : [];
      allOrders.push(newOrder);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allOrders));

      // También guardar referencia para la mesa
      localStorage.setItem(`order_${mesaActiva}`, JSON.stringify({
        orderId: newOrder.id,
        table: mesaActiva,
        totalCents,
        items,
        createdAt: now,
      }));

      // Vaciar carrito local pero mantener abierto para seguir agregando
      setCart({});
      setCartOpen(false);

      showNotice(
        t('¡Pedido enviado a cocina!'),
        lang === 'en'
          ? `Table ${mesaActiva} · We already have it on the kitchen panel.`
          : `Mesa ${mesaActiva} · Ya lo tenemos en el panel de cocina.`,
        "success",
      );
    } catch (err) {
      console.error("Send to kitchen error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      showNotice("No se pudo enviar el pedido a cocina", "Detalle: " + msg, "error");
    }
  };

  const payTableBill = async () => {
    if (!mesaActiva) return;

    try {
      // Leer TODOS los pedidos de esta mesa desde localStorage (compartido con cocina)
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        showNotice("No hay pedido pendiente", "No hay pedido pendiente para esta mesa.", "error");
        return;
      }
      const allOrders = JSON.parse(raw);
      if (!Array.isArray(allOrders) || allOrders.length === 0) {
        showNotice("No hay pedido pendiente", "No hay pedido pendiente para esta mesa.", "error");
        return;
      }

      const mesaOrders = allOrders.filter((o: any) => o.table === mesaActiva && o.status !== 'paid');
      if (mesaOrders.length === 0) {
        showNotice("No hay pedido pendiente", "No hay pedido pendiente para esta mesa.", "error");
        return;
      }

      // Combinar todos los items de todos los pedidos no pagados
      const allItems = mesaOrders.flatMap((o: any) => (o.items || []).map((it: any) => ({
        id: it.id,
        quantity: it.quantity,
        sizeLabel: it.sizeLabel,
        variant: it.variant,
        priceCents: it.priceCents,
      })));

      if (allItems.length === 0) {
        showNotice("No hay items para pagar", undefined, "error");
        return;
      }

      const totalCents = allItems.reduce((sum, it) => sum + it.priceCents * it.quantity, 0);

      // El servidor vuelve a calcular los precios desde Neon; nunca confía en priceCents.
      const checkoutItems = allItems.map(({ id, quantity, sizeLabel, variant }) => ({
        id,
        quantity,
        sizeLabel,
        variant,
      }));

      // Evita que /success muestre un carrito de domicilio ajeno si alguien
      // visita esa ruta manualmente tras un pago de mesa.
      localStorage.removeItem('cart_success');

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: checkoutItems, tipo: 'mesa', mesa: mesaActiva }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Error al crear la sesión de pago");
      }

      // El pago NO está confirmado todavía: el cliente va a la pasarela de Stripe.
      // Marcamos los pedidos como "pago con tarjeta en curso" y guardamos el
      // sessionId. El webhook confirmará el cobro y la cocina lo verá sola.
      const now = new Date().toISOString();
      const updatedOrders = allOrders.map((o: any) => {
        if (o.table === mesaActiva && o.status !== 'paid') {
          return {
            ...o,
            status: o.status,
            pagoPendienteTarjeta: true,
            pagoPendienteTarjetaAt: o.pagoPendienteTarjetaAt ?? now,
            stripeSessionId: data.sessionId,
            stripeUrl: data.url,
            pagoPendienteEfectivo: false,
            metodoPago: 'tarjeta',
          };
        }
        return o;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
      setCashPending(false);

      // Referencia de la mesa: todavía NO está pagada.
      localStorage.setItem(`order_${mesaActiva}`, JSON.stringify({
        orderId: mesaOrders[mesaOrders.length - 1]?.id,
        table: mesaActiva,
        totalCents,
        items: allItems,
        paid: false,
        stripeSessionId: data.sessionId,
        stripeUrl: data.url,
        pagoPendienteTarjeta: true,
      }));

      window.location.href = data.url;
    } catch (err) {
      console.error("Pay table bill error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      showNotice("No se pudo procesar el pago de la mesa", "Detalle: " + msg, "error");
    }
  };

  const payWithCash = () => {
    if (!mesaActiva) {
      showNotice("No se ha detectado una mesa activa.", undefined, "error");
      return;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        showNotice("No hay pedido pendiente", "No hay pedido pendiente para esta mesa.", "error");
        return;
      }

      const allOrders = JSON.parse(raw);
      if (!Array.isArray(allOrders)) {
        showNotice("No hay pedido pendiente", "No hay pedido pendiente para esta mesa.", "error");
        return;
      }

      const mesaOrders = allOrders.filter((o: any) => o.table === mesaActiva && o.status !== 'paid');
      if (mesaOrders.length === 0) {
        showNotice("No hay pedido pendiente", "No hay pedido pendiente para esta mesa.", "error");
        return;
      }

      const now = new Date().toISOString();
      const updatedOrders = allOrders.map((o: any) => {
        if (o.table === mesaActiva && o.status !== 'paid') {
          return {
            ...o,
            pagoPendienteEfectivo: true,
            pagoPendienteEfectivoAt: o.pagoPendienteEfectivoAt ?? now,
            metodoPago: 'efectivo',
          };
        }
        return o;
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));

      // Actualizar también la referencia de la mesa para que cocina sepa
      // que el cobro se hará en efectivo.
      try {
        const tableRef = localStorage.getItem(`order_${mesaActiva}`);
        if (tableRef) {
          const parsed = JSON.parse(tableRef);
          localStorage.setItem(`order_${mesaActiva}`, JSON.stringify({
            ...parsed,
            pagoPendienteEfectivo: true,
            pagoPendienteEfectivoAt: parsed.pagoPendienteEfectivoAt ?? now,
            metodoPago: 'efectivo',
          }));
        }
      } catch {
        // La referencia de mesa es opcional; el pedido principal ya está guardado.
      }

      setCashPending(true);
      fetchOrderStatus();
      showNotice(
        t('Aviso enviado al camarero'),
        t('Avisa al camarero de que vas a pagar en efectivo. Tu mesa queda pendiente de cobro.'),
        "success",
      );
    } catch (err) {
      console.error("Cash payment error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      showNotice("No se pudo avisar del pago en efectivo", "Detalle: " + msg, "error");
    }
  };

  // Cargar estado del pedido cuando cambia la mesa activa, con polling cada 5s
  useEffect(() => {
    if (!mesaActiva) {
      setOrderStatus(null);
      setOrderItemsFromStorage([]);
      setCashPending(false);
      return;
    }

    fetchOrderStatus();

    const interval = setInterval(fetchOrderStatus, 5000);
    return () => clearInterval(interval);
  }, [mesaActiva]);

  useEffect(() => {
    if (!cartOpen) return;

    // Al abrir el carrito, cargar estado del pedido de la mesa
    if (mesaActiva) {
      fetchOrderStatus();
    }

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cartCloseRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      // Si hay un modal encima, él gestiona Esc y el foco; el carrito no reacciona.
      if (document.querySelector('[data-modal-open="true"]')) return;

      if (event.key === 'Escape') {
        setCartOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = cartDrawerRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [cartOpen]);

  const cashPendingNotice = cashPending ? (
    <div className="cart-cash-notice" role="status" data-testid="text-cash-pending">
      <span className="cart-cash-notice-icon" aria-hidden="true">💶</span>
      <div>
        <strong>{t('Pago en efectivo pendiente')}</strong>
        <span>{t('Avisa al camarero de que vas a pagar en efectivo.')}</span>
        <span className="cart-cash-notice-help">{t('El camarero marcará la mesa como cobrada desde el panel de cocina.')}</span>
      </div>
    </div>
  ) : null;

  const renderTablePaymentActions = () => {
    if (orderStatus !== 'served' || cashPending) return null;

    return (
      <div className="cart-pay-actions">
        <button
          className="cart-checkout focus-ring stripe-btn"
          type="button"
          onClick={payTableBill}
          disabled={!termsAccepted}
          data-testid="button-pay-table"
          title={!termsAccepted ? 'Acepta los términos y la política de privacidad para pagar' : undefined}
        >
          <CreditCard size={18} aria-hidden="true" />
          <span>{t('Pagar con tarjeta')} — {formatPrice(tableTotalCents)}</span>
        </button>
        <button
          className="cart-checkout cart-checkout--cash focus-ring"
          type="button"
          onClick={payWithCash}
          disabled={!termsAccepted}
          data-testid="button-pay-cash"
          title={!termsAccepted ? 'Acepta los términos y la política de privacidad para pagar' : undefined}
        >
          <Banknote size={18} aria-hidden="true" />
          <span>{t('Pagar en Efectivo')} — {formatPrice(tableTotalCents)}</span>
        </button>
      </div>
    );
  };

  const preloaderOverlay = preloaderVisible ? (
    <div
      className={`fixed inset-0 z-[10000] transition-opacity duration-500 ${preloaderFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      aria-hidden={preloaderFading ? 'true' : undefined}
    >
      <CafesDeCarlaPreloader />
    </div>
  ) : null;

  if (menuError && productos.length === 0 && !menuLoading) {
    return (
      <>
        <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 p-6 text-center" style={{ background: '#f5f0e5', color: '#4a3322' }}>
          <h1 className="serif" style={{ margin: 0, fontSize: 'clamp(24px,4vw,34px)', fontWeight: 400 }}>{t('No pudimos cargar la carta')}</h1>
          <p style={{ margin: 0, maxWidth: 420, color: '#7c6f5e', fontSize: 13, lineHeight: 1.6 }}>{menuError}</p>
          <button type="button" className="text-cta focus-ring" onClick={() => loadMenu()}>
            {t('Reintentar')}
          </button>
        </div>
        {preloaderOverlay}
      </>
    );
  }

  return (
    <div className="site-shell grain min-h-[100dvh]">
      <div className="launch-ribbon" data-testid="preview-status">
        <span className="ribbon-dot" aria-hidden="true" />
        Vista previa de pre-lanzamiento · datos por confirmar
      </div>
      <header className="site-header">
        <div className="header-inner section-wrap">
          <a href="#inicio" className="brand-link focus-ring" aria-label="Cafés de Carla, inicio" data-testid="link-brand-home">
            <img src={logo} alt="Logotipo de Cafés de Carla: Huele, Saborea, Disfruta" width="1024" height="1024" data-testid="img-brand-logo" />
          </a>
          <nav className={`main-nav ${mobileOpen ? 'is-open' : ''}`} aria-label="Navegación principal" data-testid="navigation-primary">
            <a href="#historia" className="nav-link" onClick={closeNav} data-testid="link-nav-story">{t('Nuestra esencia')}</a>
            <a href="#carta" className="nav-link" onClick={closeNav} data-testid="link-nav-menu">{t('La carta')}</a>
            <a href="#visitanos" className="nav-link" onClick={closeNav} data-testid="link-nav-visit">{t('Visítanos')}</a>
            <a href="#contacto" className="nav-contact" onClick={closeNav} data-testid="link-nav-contact">{t('Hablemos')} <ArrowUpRight size={14} aria-hidden="true" /></a>
          </nav>
          <div className="header-actions">
            <ThemeToggle />
            <LangToggle />
            <button ref={cartTriggerRef} className="cart-trigger focus-ring" type="button" aria-label={lang === 'en' ? `Open cart, ${cartCount} items` : `Abrir carrito, ${cartCount} artículos`} aria-haspopup="dialog" aria-expanded={cartOpen} onClick={() => setCartOpen(true)} data-testid="button-open-cart">
              <ShoppingBag size={17} aria-hidden="true" /><span>{lang === 'en' ? 'Cart' : 'Carrito'}</span><span className="cart-count" data-testid="text-cart-count">{cartCount}</span>
            </button>
            <button className="mobile-toggle focus-ring" type="button" aria-label={mobileOpen ? 'Cerrar navegación' : 'Abrir navegación'} aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)} data-testid="button-mobile-navigation">
              {mobileOpen ? <X size={21} /> : <MenuIcon size={21} />}
            </button>
          </div>
        </div>
      </header>
      <span className="sr-only" role="status" aria-live="polite" data-testid="status-cart-count">
        {cartCount === 1 ? '1 artículo en el carrito' : `${cartCount} artículos en el carrito`}
      </span>

      {mesaActiva && (
        <section className="mesa-banner">
          <div className="mesa-banner-inner section-wrap">
            <span className="mesa-badge">🍽️ {t('MESA')} {mesaActiva}</span>
            <span className="mesa-note">{t('Estás en el local · Pide lo que quieras y paga al final')}</span>
          </div>
        </section>
      )}

      <main>
        {/* Sección 1: Héroe - BIENVENIDOS */}
        <section id="inicio" className="hero section-wrap" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="hero-overline reveal"><span className="tiny-rule" /> {t('UN RINCÓN PARA BAJAR EL RITMO')}</div>
            <h1 id="hero-title" className="serif reveal reveal-delay" data-testid="heading-home-tagline">{t('Huele.')}<br /><em>{t('Saborea.')}</em><br />{t('Disfruta.')}</h1>
            <p className="hero-description reveal reveal-delay" data-testid="text-home-introduction">{t('Un café preparado con cariño. Un ratito para ti. En Cafés de Carla, cada pausa merece saborearse.')}</p>
            <a href="#carta" className="text-cta focus-ring reveal reveal-delay" data-testid="link-hero-menu">{t('Descubre la carta')} <span><ArrowDown size={15} /></span></a>
            <div className="hero-footnote"><span>CAFÉS DE CARLA</span><span>UNA PAUSA, A TU RITMO</span></div>
          </div>
          <div className="hero-visual reveal reveal-delay">
            <div className="hero-photo photo-frame">
              <img src="/sample-coffee.jpg" alt={t('Imagen de muestra, no fotografía del local: café servido en cerámica bajo luz natural')} width="1200" height="900" fetchPriority="high" data-testid="img-sample-hero" />
              <div className="photo-stamp" aria-hidden="true"><span>un momento</span><strong>{t('un momento para ti')}</strong></div>
            </div>
            <div className="image-caption"><span className="caption-mark" /> {t('IMAGEN DE MUESTRA')} · {lang === 'en' ? 'WILL BE REPLACED BY REAL PHOTOGRAPHY' : 'SE SUSTITUIRÁ POR FOTOGRAFÍA REAL'}</div>
            <div className="hero-side-note serif">{lang === 'en' ? <>Taking<br />your time<br />also tastes good.</> : <>Tomarse<br />el tiempo<br />también sabe.</>}</div>
          </div>
          <div className="hero-seal" aria-hidden="true"><span>{t('Huele · Saborea · Disfruta')}</span><b>CD</b></div>
        </section>

        {/* Seccion: Nuestra esencia - 01 / NUESTRA ESENCIA */}
        <section className="story-section" id="historia" aria-labelledby="story-title">
          <div className="section-wrap story-grid">
            <div className="story-marker"><span className="eyebrow">{t('01 / NUESTRA ESENCIA')}</span><span className="marker-line" /></div>
            <div className="story-content">
              <h2 className="serif" id="story-title" data-testid="heading-brand-story">
                {lang === 'en' ? <>Some days call for<br /><em>a beautiful pause.</em></> : <>Hay dias que piden<br /><em>una pausa bonita.</em></>}
              </h2>
              <div className="story-bottom">
                <p>{t('En Cafes de Carla creemos en el placer sencillo de parar un momento. En el aroma que llega antes del primer sorbo, en algo rico sobre la mesa y en sentirte bien recibido.')}</p>
              </div>
              <div className="story-signature">Cafes de Carla <span>— {t('Huele · Saborea · Disfruta')}</span></div>
            </div>
            <div className="story-aside" aria-hidden="true"><span className="sun-shape" /><span className="aside-words serif">{lang === 'en' ? <>slowly<br />tastes better</> : <>despacio<br />sabe mejor</>}</span></div>
          </div>
        </section>


        {/* Sección 2: Carta */}
        <section id="carta" className="menu-section section-wrap" aria-labelledby="menu-title">
          <div className="section-kicker"><span className="eyebrow">{t('02 / PARA DISFRUTAR')}</span><span className="kicker-line" /></div>
          <div className="menu-heading">
            <div><h2 id="menu-title" className="serif" data-testid="heading-menu">{lang === 'en' ? <>Something delicious,<br /><em>in good company.</em></> : <>Algo rico,<br /><em>en buena compañía.</em></>}</h2></div>
            <p data-testid="text-menu-introduction">{t('Nuestra carta se actualiza desde la base de datos: productos, precios, tamaños y disponibilidad en tiempo real.')}</p>
          </div>

          {menuLoading ? (
            <div className="menu-status" role="status" data-testid="menu-loading">
              <Clock3 size={22} aria-hidden="true" />
              <p>{t('Cargando la carta...')}</p>
            </div>
          ) : menuError && menuCategories.length === 0 ? (
            <div className="menu-status" role="alert" data-testid="menu-error">
              <p>{menuError}</p>
              <button type="button" className="text-cta focus-ring" onClick={() => loadMenu()}>{t('Reintentar')}</button>
            </div>
          ) : menuCategories.length === 0 ? (
            <div className="menu-status" data-testid="menu-empty">
              <p>{t('La carta está vacía en este momento. Vuelve a intentarlo en unos minutos.')}</p>
            </div>
          ) : (
            <>
                            <div className="category-list-wrap">
                {catCanLeft && (
                  <button type="button" className="category-scroll-btn category-scroll-btn-left" aria-label="Desplazar categorías a la izquierda" onClick={() => scrollCategoriesBy(-1)}>
                    <ChevronLeft size={18} aria-hidden="true" />
                  </button>
                )}
                <div
                  className="category-list"
                  role="tablist"
                  aria-label="Categorías de la carta"
                  data-testid="menu-category-tabs"
                  ref={categoryListRef}
                  onPointerDown={onCategoryPointerDown}
                  onClickCapture={onCategoryClickCapture}
                >
                  {menuCategories.map((category, index) => (
                    <button
                      key={category.id}
                      type="button"
                      role="tab"
                      aria-selected={selected?.id === category.id}
                      aria-controls="category-panel"
                      className={`category-tab ${selected?.id === category.id ? 'active' : ''}`}
                      onClick={(e) => {
                        setActiveCategory(category.id);
                        const list = categoryListRef.current;
                        if (list) {
                          const left = e.currentTarget.offsetLeft - list.clientWidth / 2 + e.currentTarget.clientWidth / 2;
                          list.scrollTo({ left, behavior: 'smooth' });
                        }
                      }}
                      data-testid={`tab-category-${category.id}`}
                    >
                      <span className="category-number">{String(index + 1).padStart(2, '0')}</span><span className="category-name">{category.title}</span><ArrowRight size={17} aria-hidden="true" />
                    </button>
                  ))}
                </div>
                {catCanRight && (
                  <button type="button" className="category-scroll-btn category-scroll-btn-right" aria-label="Desplazar categorías a la derecha" onClick={() => scrollCategoriesBy(1)}>
                    <ChevronRight size={18} aria-hidden="true" />
                  </button>
                )}
              </div>
              {selected && (
                <section className="category-panel" role="tabpanel" id="category-panel" aria-labelledby={`tab-category-${selected.id}`} aria-label={selected.title} data-testid={`panel-category-${selected.id}`}>
                  <div className="category-copy">
                    <div>
                      <span className="eyebrow">{t('EN LA CARTA')}</span>
                      <h3 className="serif" data-testid={`heading-category-${selected.id}`}>{selected.title}</h3>
                    </div>
                    {selected.note && <p>{selected.note}</p>}
                  </div>
                  <ul className="product-grid max-w-7xl mx-auto w-full" data-testid={`list-menu-${selected.id}`}>
                    {selected.items.map((item) => (
                      <ProductCard key={item.id} item={item} count={selected.items.length} onAdd={(size, variant) => changeCartQuantity(item.id, size, 1, variant)} />
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
          <p className="menu-disclaimer" data-testid="text-menu-preview-disclosure">Precios y disponibilidad actualizados desde la base de datos. Las fotos son ilustrativas y pueden sustituirse por imágenes reales de los productos.</p>
        </section>

        {/* Pausa */}
        <section className="pause-band" aria-label="Eslogan de Cafés de Carla">
          <div className="pause-inner section-wrap"><span className="pause-small">{t('EL PLACER DE HACER UNA COSA A LA VEZ')}</span><p className="serif">"Cafés de Carla: {t('Huele · Saborea · Disfruta').replace(/ · /g, ', ')}"</p><span className="pause-ornament" aria-hidden="true" /></div>
        </section>


{/* Sección 3: Visítanos - 03 / CUANDO QUIERAS */}
        <section className="visit-section section-wrap" id="visitanos" aria-labelledby="visit-title">
          <div className="section-kicker"><span className="eyebrow">{t('03 / CUANDO QUIERAS')}</span><span className="kicker-line" /></div>
          <div className="visit-heading">
            <h2 id="visit-title" className="serif" data-testid="heading-visit">{lang === 'en' ? <>The table is<br /><em>set.</em></> : <>La mesa está<br /><em>servida.</em></>}</h2>
            <p data-testid="text-visit-introduction">{t('Encuéntranos en el Centro Comercial Las Arenas, en Las Palmas de Gran Canaria. Te esperamos con el café recién hecho.')}</p>
          </div>
          <div className="visit-grid">
            <div className="map-placeholder" data-testid="map-embed">
              <iframe
                title="Mapa de Cafés de Carla — Centro Comercial Las Arenas"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d-15.4487836!3d28.1282921!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xc40951c500e904b%3A0xf76cda3da985224b!2sCaf%C3%A9s%20de%20Carla!5e0!3m2!1ses!2ses!4v1763000000000"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, zIndex: 2 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                className="map-open-link focus-ring"
                href="https://www.google.com/maps/place/Caf%C3%A9s+de+Carla/@28.1282921,-15.4487836,17z"
                target="_blank"
                rel="noreferrer"
                style={{
                  position: 'absolute',
                  bottom: 14,
                  right: 14,
                  zIndex: 3,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#4a3322',
                  color: '#fff',
                  padding: '9px 14px',
                  borderRadius: 8,
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 6px 16px rgba(74, 51, 34, 0.28)',
                }}
              >
                <MapPin size={14} aria-hidden="true" />
                {t('Abrir en Google Maps')}
              </a>
            </div>
            <div className="visit-details">
              <article className="detail-block"><span className="detail-icon"><MapPin size={17} /></span><div><span className="eyebrow">{t('DÓNDE ENCONTRARNOS')}</span><h3>{t('Dirección')}</h3><p data-testid="text-address" className="text-sm text-[#8a7a69]"><strong className="text-[#4a3322] font-serif">Centro Comercial Las Arenas</strong> · Ctra. del Rincón, 35010 · Las Palmas de Gran Canaria</p></div></article>
              <article className="detail-block"><span className="detail-icon"><Clock3 size={17} /></span><div><span className="eyebrow">{t('PARA TU PRÓXIMA PAUSA')}</span><h3>{t('Horario')}</h3><p data-testid="text-hours" className="text-sm text-[#8a7a69]"><strong className="text-[#4a3322] font-serif">{lang === 'en' ? 'Monday to Friday' : 'Lunes a viernes'}</strong> · 9:00 — 22:00<br /><strong className="text-[#4a3322] font-serif">{lang === 'en' ? 'Saturday and Sunday' : 'Sábado y domingo'}</strong> · 10:00 — 22:00</p></div></article>
              <div className="contact-box" id="contacto">
                <span className="eyebrow">{t('ESTAMOS AQUÍ PARA AYUDAR')}</span>
                <p>{t('Si tienes cualquier duda, llámanos o escríbenos y te atenderemos encantados.')}</p>
                <div className="contact-placeholders">
                  <a className="contact-placeholder focus-ring" href="tel:+34928493380"><Phone size={15} /> 928 49 33 80</a>
                  <a className="contact-placeholder focus-ring" href="https://www.facebook.com/cafesdecarla/" target="_blank" rel="noreferrer">Facebook · Cafés de Carla</a>
                </div>
                <span className="contact-footnote">{t('También puedes ver la ubicación exacta en el mapa.')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 4: Social */}
        <section className="social-section" aria-labelledby="social-title">
          <div className="section-wrap social-inner">
            <div className="social-copy"><span className="eyebrow">{t('04 / UN POQUITO MÁS CERCA')}</span><h2 id="social-title" className="serif">{lang === 'en' ? <>What happens<br /><em>on the other side.</em></> : <>Lo que pasa<br /><em>al otro lado.</em></>}</h2><p>{t('Pronto podrás asomarte a nuestro día a día.')}</p><span className="social-handle"><Instagram size={17} /> {t('Cuenta de Instagram — Confirmación próxima')}</span></div>
            <div className="social-grid" data-testid="instagram-feed-placeholder" aria-label="Vista previa del feed de Instagram, aún sin publicaciones">
              <div className="social-tile tile-one"><span className="tile-ring" /><span className="tile-text serif">{lang === 'en' ? <>a coffee<br />and a breath</> : <>un café<br />y un respiro</>}</span><small>{lang === 'en' ? 'DESIGN SAMPLE' : 'MUESTRA DE DISEÑO'}</small></div>
              <div className="social-tile tile-two"><span className="tile-square" /><span className="tile-text serif">{lang === 'en' ? <>at your<br />own pace</> : <>a tu<br />ritmo</>}</span><small>{lang === 'en' ? 'DESIGN SAMPLE' : 'MUESTRA DE DISEÑO'}</small></div>
              <div className="social-tile tile-three"><img src="/sample-coffee.jpg" alt="Imagen ilustrativa de café, no corresponde a la cuenta real de Instagram" loading="lazy" width="640" height="640" data-testid="img-sample-hero" /><span className="tile-overlay">{lang === 'en' ? 'SAMPLE PHOTOGRAPHY' : 'FOTOGRAFÍA DE MUESTRA'}</span></div>
              <div className="feed-overlay"><Instagram size={20} /><span>{t('El feed aparecerá aquí')}<br />{t('cuando tengamos la cuenta')}</span></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main section-wrap">
          <a href="#inicio" className="footer-brand focus-ring" aria-label="Volver al inicio" data-testid="link-footer-home"><img src={logo} alt="Logotipo de Cafés de Carla" width="1024" height="1024" loading="lazy" /><span className="serif">Cafés de Carla</span></a>
          <p className="footer-tagline serif">{t('Huele, Saborea, Disfruta.')}</p>
          <LegalLinks />
          <a className="back-top" href="#inicio" data-testid="link-back-to-top">{t('Volver arriba')} <ArrowUpRight size={15} /></a>
        </div>
        <div className="footer-bottom section-wrap"><span>© Cafés de Carla</span><span>PREVISUALIZACIÓN DE PRUEBA · NO PUBLICAR</span><span>{t('Hecho para disfrutar sin prisa.')}</span></div>
      </footer>

      {/* Cart Drawer - only rendered when open */}
      {cartOpen && (
        <>
          <button className="cart-backdrop" type="button" aria-label={lang === 'en' ? 'Close cart' : 'Cerrar carrito'} onClick={() => setCartOpen(false)} data-testid="button-close-cart-backdrop" />
          <aside ref={cartDrawerRef} className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" tabIndex={-1} data-testid="panel-cart">
            <div className="cart-header">
              <div><span className="eyebrow">{t('TU SELECCIÓN')}</span><h2 className="serif" id="cart-title">{t('Tu carrito')}</h2></div>
              <button ref={cartCloseRef} className="cart-close focus-ring" type="button" aria-label={lang === 'en' ? 'Close cart' : 'Cerrar carrito'} onClick={() => setCartOpen(false)} data-testid="button-close-cart"><X size={20} /></button>
            </div>
            <div className="cart-body">
            {cartLines.length === 0 && mesaActiva && orderItemsFromStorage.length > 0 ? (
              <>
                <div className="cart-empty cart-empty--order" data-testid="empty-cart">
                  <ShoppingBag size={28} aria-hidden="true" />
                  {orderStatus === 'served' ? (
                    <p>{cashPending ? t('Pago en efectivo pendiente.') : t('Tu pedido está listo para pagar.')}</p>
                  ) : orderStatus === 'paid' ? (
                    <p>{t('Tu pedido ya está pagado.')}</p>
                  ) : (
                    <p>{t('Tu pedido ya fue enviado a cocina.')}</p>
                  )}
                  <p className="cart-empty-copy">
                    {t('Puedes seguir agregando más productos o completar el pago.')}
                  </p>
                  <a className="text-cta focus-ring" href="#carta" onClick={() => setCartOpen(false)} data-testid="link-cart-to-menu">{t('Seguir pidiendo')} <ArrowDown size={15} /></a>
                </div>

                <div className="cart-table-info">
                  <div className="cart-table-status">
                    <span>{t('Estado')}</span>
                    <strong>
                      {orderStatus === 'pending' ? t('Pendiente') : orderStatus === 'confirmed' ? t('Confirmado') : orderStatus === 'served' ? t('Servido') : orderStatus === 'paid' ? t('Pagado') : '—'}
                    </strong>
                  </div>
                  <div className="cart-table-items">
                    <strong className="cart-table-items-title">{t('Items en cocina')}</strong>
                    <div className="cart-table-list">
                      {orderItemsFromStorage.map((item) => (
                        <div className="cart-table-item" key={item.id + '-' + item.quantity}>
                          <span className="cart-table-item-name">
                            {item.quantity} × {item.name}
                            {item.sizeLabel ? ` (${displaySizeLabel(menuItemsById.get(item.id)?.category ?? '', item.sizeLabel, lang)})` : ''}
                            {item.variant ? ` · ${item.variant}` : ''}
                          </span>
                          <strong>{formatPrice(item.priceCents * item.quantity)}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="cart-table-total">
                      <span>{t('Total cocina')}</span>
                      <strong>{formatPrice(orderItemsFromStorage.reduce((s, i) => s + i.priceCents * i.quantity, 0))}</strong>
                    </div>
                  </div>
                </div>
              </>
            ) : cartLines.length === 0 ? (
              <div className="cart-empty" data-testid="empty-cart">
                <ShoppingBag size={28} aria-hidden="true" />
                <p>{t('Tu carrito todavía está vacío.')}</p>
                <a className="text-cta focus-ring" href="#carta" onClick={() => setCartOpen(false)} data-testid="link-cart-to-menu">{t('Volver a la carta')} <ArrowDown size={15} /></a>
              </div>
            ) : (
              <>
                <ul className="cart-lines" data-testid="list-cart-items">
                  {cartLines.map((line) => {
                    const item = menuItemsById.get(line.itemId);
                    const price = priceForLine(item, line.sizeLabel);
                    return (
                      <li className="cart-line" key={`${line.itemId}|${line.sizeLabel}`} data-testid={`cart-item-${line.itemId}-${line.sizeLabel}`}>
                        <div className="cart-line-main">
                          <div>
                            <h3 data-testid={`cart-name-${line.itemId}`}>{item?.name ?? line.itemId}</h3>
                            <span className={price === 0 ? 'cart-price-pending' : 'cart-line-price'} data-testid={`cart-price-${line.itemId}`}>
                              {price === 0 ? t('Precio por confirmar') : formatPrice(price * line.quantity)}
                            </span>
                          </div>
                          <div className="cart-quantity-controls" role="group" aria-label={`Cantidad de ${item?.name ?? line.itemId}`}>
                            <button className="quantity-button focus-ring" type="button" aria-label={`Quitar una unidad de ${item?.name ?? line.itemId}`} onClick={() => changeCartQuantity(line.itemId, line.sizeLabel, -1)} data-testid={`button-remove-one-${line.itemId}`}><Minus size={14} /></button>
                            <span className="quantity-value" data-testid={`text-quantity-${line.itemId}`}>{line.quantity}</span>
                            <button className="quantity-button focus-ring" type="button" aria-label={`Añadir una unidad de ${item?.name ?? line.itemId}`} onClick={() => changeCartQuantity(line.itemId, line.sizeLabel, 1)} data-testid={`button-add-one-${line.itemId}`}><Plus size={14} /></button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', gap: '8px' }}>
                          <span style={{ fontSize: '11px', color: '#7c6f5e' }}>{displaySizeLabel(item?.category ?? '', line.sizeLabel, lang)}{line.variant ? ` · ${line.variant}` : ''}</span>
                          <button style={{ background: 'none', border: 'none', color: '#948675', fontSize: '10px', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => removeFromCart(line.itemId, line.sizeLabel)}>{t('Eliminar')}</button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            </div>
            <div className="cart-footer">
              {!allPriced && cartLines.length > 0 && <p className="cart-partial-note" role="note" data-testid="text-cart-partial-total">El total es parcial: hay productos sin precio indicado en la carta.</p>}
              <div className="cart-total" data-testid="text-cart-total"><span>{hasUnpricedLines ? 'Subtotal parcial' : 'Subtotal'}</span><strong>{formatPrice(tableTotalCents)}</strong></div>
              <div className="cart-terms">
                <input
                  id="cart-terms-checkbox"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(event) => setTermsAccepted(event.target.checked)}
                  data-testid="checkbox-cart-terms"
                />
                <label htmlFor="cart-terms-checkbox">
                  {t('He leído y acepto los')}{' '}
                  <a href="/aviso-legal" onClick={(event) => event.stopPropagation()}>{t('Términos y Condiciones')}</a>
                  {' '}{lang === 'en' ? 'and the' : 'y la'}{' '}
                  <a href="/politica-privacidad" onClick={(event) => event.stopPropagation()}>{t('Política de Privacidad')}</a>
                </label>
              </div>
              {mesaActiva ? (
                <>
                  {cashPendingNotice}
                  {cartLines.length > 0 ? (
                    <>
                      {orderStatus === 'served' && !cashPending && (
                        <p className="cart-preview-note" style={{ color: '#6b7d4c', fontWeight: 700, marginBottom: '12px' }}>
                          {t('Tu pedido anterior está servido · Puedes pagar o agregar más')}
                        </p>
                      )}
                      {orderStatus === 'paid' && (
                        <p className="cart-preview-note" style={{ color: '#6b7d4c', fontWeight: 700, marginBottom: '12px' }}>
                          {t('Pedido anterior pagado ✓ · Puedes seguir pidiendo')}
                        </p>
                      )}
                      {orderStatus !== 'served' && orderStatus !== 'paid' && (
                        <p className="cart-preview-note" style={{ color: '#7c6f5e', fontSize: '11px', marginBottom: '12px' }}>
                          {t('Tu pedido ya fue enviado a cocina. Puedes agregar más items.')}
                        </p>
                      )}
                      <button
                        className="cart-checkout focus-ring stripe-btn" type="button" onClick={sendToKitchen} disabled={!allPriced} data-testid="button-add-more-kitchen"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', background: '#6b7d4c', borderColor: '#6b7d4c' }}
                      >
                        <span style={{ fontSize: '18px', marginRight: '6px' }}>🍽️</span>
                        <span>{t('Agregar más a cocina')} — {formatPrice(tableTotalCents)}</span>
                      </button>
                      {renderTablePaymentActions()}
                      <button className="cart-clear focus-ring" type="button" onClick={() => setCart({})} data-testid="button-clear-cart">{t('Vaciar carrito')}</button>
                    </>
                  ) : (
                    <>
                      {orderStatus === 'served' && !cashPending && (
                        <p className="cart-preview-note" style={{ color: '#6b7d4c', fontWeight: 700, marginBottom: '12px' }}>
                          Tu pedido está servido · Puedes pagar ahora
                        </p>
                      )}
                      {renderTablePaymentActions()}
                      {orderStatus === 'paid' && (
                        <p style={{ color: '#6b7d4c', fontWeight: 700, fontSize: '14px', textAlign: 'center' }}>
                          Pedido pagado ✓
                        </p>
                      )}
                      {orderStatus !== 'served' && orderStatus !== 'paid' && (
                        <p className="cart-preview-note" style={{ marginTop: '16px', fontSize: '11px' }}>
                          Espera a que la cocina marque tu pedido como servido para poder pagar.
                        </p>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  <button
                    className="cart-checkout focus-ring stripe-btn" type="button" onClick={checkout} disabled={!allPriced || !termsAccepted} data-testid="button-checkout" title={!termsAccepted ? 'Acepta los términos y la política de privacidad para pagar' : undefined}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <CreditCard size={18} aria-hidden="true" />
                    <span>{t('Terminar pedido')} — {formatPrice(cartSubtotal)}</span>
                  </button>
                  <button className="cart-clear focus-ring" type="button" onClick={() => setCart({})} data-testid="button-clear-cart">{t('Vaciar carrito')}</button>
                </>
              )}
            </div>
          </aside>
        </>
      )}

      <FloatingCartButton
        count={cartCount}
        isOpen={cartOpen}
        onOpen={() => setCartOpen(true)}
      />
      <NotificationModal
        open={notice !== null}
        onClose={() => setNotice(null)}
        title={notice?.title ?? ''}
        message={notice?.message}
        variant={notice?.variant ?? 'info'}
        autoCloseMs={3500}
      />
      {preloaderOverlay}
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/success" component={Success} />
        <Route path="/aviso-legal" component={() => <LegalPage kind="aviso-legal" />} />
        <Route path="/politica-privacidad" component={() => <LegalPage kind="politica-privacidad" />} />
        <Route path="/politica-cookies" component={() => <LegalPage kind="politica-cookies" />} />
        <Route path="/login" component={Login} />
        <Route path="/acceso-denegado" component={AccessDenied} />
        <Route path="/cocina" component={() => <ProtectedRoute requiredRole="cocina"><Cocina /></ProtectedRoute>} />
        <Route path="/admin" component={() => <ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <CookieBanner />
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;