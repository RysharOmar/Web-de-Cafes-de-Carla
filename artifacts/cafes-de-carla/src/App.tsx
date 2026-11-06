import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Clock3, CreditCard, Instagram, MapPin, Menu as MenuIcon, Minus, Phone, Plus, ShoppingBag, X } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Success from '@/pages/success';
import Cocina from '@/pages/cocina';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { menuCategories } from './data/menu';

const queryClient = new QueryClient();
const logo = '/cafes-de-carla-logo.jpg';

const menuItemsById = new Map(menuCategories.flatMap((category) => category.items).map((item) => [item.id, item] as const));
const menuItemCategoryById = new Map(menuCategories.flatMap((category) => category.items.map((item) => [item.id, category.id] as const)));

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

// Price fetching function
async function priceForSize(itemId: string, sizeLabel: string): Promise<number> {
  const res = await fetch(`/api/price?itemId=${encodeURIComponent(itemId)}&size=${encodeURIComponent(sizeLabel)}`);
  const data = await res.json();
  return data.priceCents ?? 0;
}

function ProductCard({ item, category, onAdd }: { item: any; category: any; onAdd: (size: string, variant: string | null) => void }) {
  const [selectedSize, setSelectedSize] = useState(item.defaultSize);
  const [selectedVariant, setSelectedVariant] = useState(item.defaultVariant ?? null);

  const hasSizes = item.sizes && item.sizes.length > 1;
  const hasVariants = Boolean(item.variants?.length);

  return (
    <li className="product-card" key={item.id} data-testid={`item-menu-${item.id}`}>
      <div className="product-photo">
        <img
          src={category.image ?? '/sample-brunch.jpg'}
          alt={`Imagen de muestra; no es una fotografía real de ${item.name}`}
          loading="lazy"
          decoding="async"
          width="960"
          height="720"
          data-testid={`img-product-${item.id}`}
        />
        <span className="product-photo-label">IMAGEN DE MUESTRA</span>
      </div>
      <div className="product-card-content">
        <h4 data-testid={`name-menu-${item.id}`}>{item.name}</h4>
        <p data-testid={`description-menu-${item.id}`}>{item.description ?? 'Detalles por confirmar'}</p>

        {hasSizes && (
          <div className="variant-selector" data-testid={`size-selector-${item.id}`}>
            <label>Tamaño:</label>
            <div className="variant-options">
              {item.sizes.map((s: any) => (
                <button
                  key={s.label}
                  type="button"
                  className={`variant-btn ${selectedSize === s.label ? 'active' : ''}`}
                  onClick={() => setSelectedSize(s.label)}
                  data-testid={`size-${item.id}-${s.label}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasVariants && (
          <div className="variant-selector" data-testid={`variant-selector-${item.id}`}>
            <label>Elige tu opción:</label>
            <div className="variant-options">
              {item.variants.map((v: string) => (
                <button
                  key={v}
                  type="button"
                  className={`variant-btn ${selectedVariant === v ? 'active' : ''}`}
                  onClick={() => setSelectedVariant(v)}
                  data-testid={`variant-${item.id}-${v}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="product-card-footer">
          <span className="product-card-price" data-testid={`price-menu-${item.id}`}>
            {item.sizes && item.sizes.length > 1
              ? item.sizes.find((s: any) => s.label === selectedSize)
                ? formatPrice(item.sizes.find((s: any) => s.label === selectedSize).priceCents)
                : formatPrice(item.sizes[0].priceCents)
              : formatPrice(item.priceCents ?? 0)}
          </span>
          <button className="add-to-cart focus-ring" type="button" aria-label={`Añadir ${item.name} al carrito`} onClick={() => onAdd(selectedSize, selectedVariant)} data-testid={`button-add-menu-${item.id}`}>
            <Plus size={15} aria-hidden="true" /><span>Añadir</span>
          </button>
        </div>
      </div>
    </li>
  );
}

function Home() {
  const [activeCategory, setActiveCategory] = useState('featured');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<Record<string, { itemId: string; quantity: number; sizeLabel: string; variant: string | null }>>({});
  const selected = menuCategories.find((category) => category.id === activeCategory) ?? menuCategories[0];
  const cartTriggerRef = useRef<HTMLButtonElement>(null);
  const cartCloseRef = useRef<HTMLButtonElement>(null);
  const cartDrawerRef = useRef<HTMLElement>(null);

  const searchParams = new URLSearchParams(window.location.search);
  const mesaActiva = searchParams.get('mesa'); // ej: "5" o null

  const STORAGE_KEY = 'cafes_de_carla_orders';

  // Estado para rastrear el pedido de la mesa (modo local)
  const [orderStatus, setOrderStatus] = useState<'pending' | 'confirmed' | 'served' | 'paid' | null>(null);
  const [orderItemsFromStorage, setOrderItemsFromStorage] = useState<{ id: string; name: string; quantity: number; sizeLabel: string; variant?: string | null; priceCents: number }[]>([]);

  async function fetchOrderStatus() {
    if (!mesaActiva) return;
    try {
      // Leer pedidos desde localStorage (compartido con la cocina)
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const allOrders = JSON.parse(raw);
      if (!Array.isArray(allOrders) || allOrders.length === 0) return;

      // Filtrar pedidos de esta mesa
      const mesaOrders = allOrders.filter((o: any) => o.table === mesaActiva);
      if (mesaOrders.length === 0) return;

      // El estado general es el del pedido más reciente (o 'servido' si alguno lo está)
      const latestOrder = mesaOrders[mesaOrders.length - 1];
      const anyServed = mesaOrders.some((o) => o.status === 'served' || o.status === 'paid');
      const status = anyServed ? (mesaOrders.some((o) => o.status === 'paid') ? 'paid' : 'served') : latestOrder.status;

      setOrderStatus(status as 'pending' | 'confirmed' | 'served' | 'paid');
      // Combinar items de todos los pedidos no pagados para mostrar en el carrito
      const unpaidItems = mesaOrders
        .filter((o) => o.status !== 'paid')
        .flatMap((o: any) => o.items || []);
      setOrderItemsFromStorage(unpaidItems);
    } catch (err) {
      console.error('Error fetching order status:', err);
    }
  }

  const cartLines = Object.values(cart);
  const cartCount = cartLines.reduce((total, line) => total + line.quantity, 0);
  const cartSubtotal = cartLines.reduce((total, line) => {
    const item = menuItemsById.get(line.itemId);
    const price = item?.sizes?.find((s: any) => s.label === line.sizeLabel)?.priceCents ?? item?.priceCents ?? 0;
    return total + price * line.quantity;
  }, 0);

  // Subtotal total de la mesa: carrito local + items en cocina (no pagados)
  const [tableTotalCents, setTableTotalCents] = useState(0);

  useEffect(() => {
    if (!mesaActiva) {
      setTableTotalCents(cartSubtotal);
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setTableTotalCents(cartSubtotal);
        return;
      }
      const allOrders = JSON.parse(raw);
      if (!Array.isArray(allOrders)) {
        setTableTotalCents(cartSubtotal);
        return;
      }
      const mesaOrders = allOrders.filter((o: any) => o.table === mesaActiva && o.status !== 'paid');
      const kitchenTotal = mesaOrders.reduce((sum: number, o: any) => {
        return sum + (o.items || []).reduce((iSum: number, it: any) => iSum + it.priceCents * it.quantity, 0);
      }, 0);
      setTableTotalCents(cartSubtotal + kitchenTotal);
    } catch {
      setTableTotalCents(cartSubtotal);
    }
  }, [cartSubtotal, mesaActiva]);

  const allPriced = cartLines.length > 0 && cartLines.every((line) => {
    const item = menuItemsById.get(line.itemId);
    const price = item?.sizes?.find((s: any) => s.label === line.sizeLabel)?.priceCents ?? item?.priceCents ?? 0;
    return price > 0;
  });

  const closeNav = () => setMobileOpen(false);
  const cartKey = (itemId: string, sizeLabel: string) => `${itemId}|${sizeLabel}`;

  const changeCartQuantity = (itemId: string, sizeLabel: string, adjustment: number, variant: string | null = null) => {
    const categoryId = menuItemCategoryById.get(itemId);
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
        next[key] = { itemId, quantity, sizeLabel, variant: existing?.variant ?? variant ?? null };
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
      const items = cartLines.map((line) => {
        const item = menuItemsById.get(line.itemId);
        const price = item?.sizes?.find((s: any) => s.label === line.sizeLabel)?.priceCents ?? item?.priceCents ?? 0;
        return {
          id: line.itemId,
          quantity: line.quantity,
          sizeLabel: line.sizeLabel,
          variant: line.variant ?? undefined,
          priceCents: price,
        };
      });

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Error al crear la sesión de pago");
      }

      const cartSummary = cartLines.map((line) => {
        const item = menuItemsById.get(line.itemId);
        const price = item?.sizes?.find((s: any) => s.label === line.sizeLabel)?.priceCents ?? item?.priceCents ?? 0;
        return {
          name: item?.name ?? line.itemId,
          qty: line.quantity,
          sizeLabel: line.sizeLabel,
          variant: line.variant ?? undefined,
          priceCents: price,
        };
      });
      localStorage.setItem('cart_success', JSON.stringify(cartSummary));

      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      alert("No se pudo preparar el pago. Inténtalo de nuevo.\n\nDetalle: " + msg);
    }
  };

  // --- Funciones para modo "En el local" (mesa) ---

  const sendToKitchen = async () => {
    if (!mesaActiva) {
      alert("No se ha detectado una mesa activa.");
      return;
    }
    if (!allPriced) return;

    try {
      const items = cartLines.map((line) => {
        const item = menuItemsById.get(line.itemId);
        const price = item?.sizes?.find((s: any) => s.label === line.sizeLabel)?.priceCents ?? item?.priceCents ?? 0;
        return {
          id: line.itemId,
          name: item?.name ?? line.itemId,
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

      alert(`Pedido enviado a cocina — Mesa ${mesaActiva}`);
    } catch (err) {
      console.error("Send to kitchen error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      alert("No se pudo enviar el pedido a cocina.\n\nDetalle: " + msg);
    }
  };

  const payTableBill = async () => {
    if (!mesaActiva) return;

    try {
      // Leer TODOS los pedidos de esta mesa desde localStorage (compartido con cocina)
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        alert("No hay pedido pendiente para esta mesa.");
        return;
      }
      const allOrders = JSON.parse(raw);
      if (!Array.isArray(allOrders) || allOrders.length === 0) {
        alert("No hay pedido pendiente para esta mesa.");
        return;
      }

      const mesaOrders = allOrders.filter((o: any) => o.table === mesaActiva && o.status !== 'paid');
      if (mesaOrders.length === 0) {
        alert("No hay pedido pendiente para esta mesa.");
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
        alert("No hay items para pagar.");
        return;
      }

      const totalCents = allItems.reduce((sum, it) => sum + it.priceCents * it.quantity, 0);

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: allItems }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Error al crear la sesión de pago");
      }

      // Marcar TODOS los pedidos de esta mesa como pagados en localStorage
      const updatedOrders = allOrders.map((o: any) => {
        if (o.table === mesaActiva && o.status !== 'paid') {
          return { ...o, status: 'paid', paidAt: new Date().toISOString(), stripeUrl: data.url };
        }
        return o;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));

      // También actualizar la referencia de la mesa
      localStorage.setItem(`order_${mesaActiva}`, JSON.stringify({
        orderId: mesaOrders[mesaOrders.length - 1]?.id,
        table: mesaActiva,
        totalCents,
        items: allItems,
        paid: true,
        paidAt: new Date().toISOString(),
        stripeUrl: data.url,
      }));

      window.location.href = data.url;
    } catch (err) {
      console.error("Pay table bill error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      alert("No se pudo procesar el pago de la mesa.\n\nDetalle: " + msg);
    }
  };

  // Cargar estado del pedido cuando cambia la mesa activa, con polling cada 5s
  useEffect(() => {
    if (!mesaActiva) {
      setOrderStatus(null);
      setOrderItemsFromStorage([]);
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
            <a href="#historia" className="nav-link" onClick={closeNav} data-testid="link-nav-story">Nuestra esencia</a>
            <a href="#carta" className="nav-link" onClick={closeNav} data-testid="link-nav-menu">La carta</a>
            <a href="#visitanos" className="nav-link" onClick={closeNav} data-testid="link-nav-visit">Visítanos</a>
            <a href="#contacto" className="nav-contact" onClick={closeNav} data-testid="link-nav-contact">Hablemos <ArrowUpRight size={14} aria-hidden="true" /></a>
          </nav>
          <button ref={cartTriggerRef} className="cart-trigger focus-ring" type="button" aria-label={`Abrir carrito, ${cartCount} artículos`} aria-haspopup="dialog" aria-expanded={cartOpen} onClick={() => setCartOpen(true)} data-testid="button-open-cart">
            <ShoppingBag size={17} aria-hidden="true" /><span>Carrito</span><span className="cart-count" data-testid="text-cart-count">{cartCount}</span>
          </button>
          <button className="mobile-toggle focus-ring" type="button" aria-label={mobileOpen ? 'Cerrar navegación' : 'Abrir navegación'} aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)} data-testid="button-mobile-navigation">
            {mobileOpen ? <X size={21} /> : <MenuIcon size={21} />}
          </button>
        </div>
      </header>
      <span className="sr-only" role="status" aria-live="polite" data-testid="status-cart-count">
        {cartCount === 1 ? '1 artículo en el carrito' : `${cartCount} artículos en el carrito`}
      </span>

      {mesaActiva && (
        <section className="mesa-banner">
          <div className="mesa-banner-inner section-wrap">
            <span className="mesa-badge">🍽️ Mesa {mesaActiva}</span>
            <span className="mesa-note">Estás en el local · Pide lo que quieras y paga al final</span>
          </div>
        </section>
      )}

      <main>
        {/* Sección 1: Héroe - BIENVENIDOS */}
        <section id="inicio" className="hero section-wrap" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="hero-overline reveal"><span className="tiny-rule" /> UN RINCÓN PARA BAJAR EL RITMO</div>
            <h1 id="hero-title" className="serif reveal reveal-delay" data-testid="heading-home-tagline">Huele.<br /><em>Saborea.</em><br />Disfruta.</h1>
            <p className="hero-description reveal reveal-delay" data-testid="text-home-introduction">Un café preparado con cariño. Un ratito para ti. En Cafés de Carla, cada pausa merece saborearse.</p>
            <a href="#carta" className="text-cta focus-ring reveal reveal-delay" data-testid="link-hero-menu">Descubre la carta <span><ArrowDown size={15} /></span></a>
            <div className="hero-footnote"><span>CAFÉS DE CARLA</span><span>UNA PAUSA, A TU RITMO</span></div>
          </div>
          <div className="hero-visual reveal reveal-delay">
            <div className="hero-photo photo-frame">
              <img src="/sample-coffee.jpg" alt="Imagen de muestra, no fotografía del local: café servido en cerámica bajo luz natural" width="1200" height="900" fetchPriority="high" data-testid="img-sample-hero" />
              <div className="photo-stamp" aria-hidden="true"><span>un momento</span><strong>para ti</strong></div>
            </div>
            <div className="image-caption"><span className="caption-mark" /> IMAGEN DE MUESTRA · SE SUSTITUIRÁ POR FOTOGRAFÍA REAL</div>
            <div className="hero-side-note serif">Tomarse<br />el tiempo<br />también sabe.</div>
          </div>
          <div className="hero-seal" aria-hidden="true"><span>Huele · Saborea · Disfruta</span><b>CD</b></div>
        </section>

        {/* Seccion: Nuestra esencia - 01 / NUESTRA ESENCIA */}
        <section className="story-section" id="historia" aria-labelledby="story-title">
          <div className="section-wrap story-grid">
            <div className="story-marker"><span className="eyebrow">01 / NUESTRA ESENCIA</span><span className="marker-line" /></div>
            <div className="story-content">
              <h2 className="serif" id="story-title" data-testid="heading-brand-story">Hay dias que piden<br /><em>una pausa bonita.</em></h2>
              <div className="story-bottom">
                <p>En Cafes de Carla creemos en el placer sencillo de parar un momento. En el aroma que llega antes del primer sorbo, en algo rico sobre la mesa y en sentirte bien recibido.</p>
              </div>
              <div className="story-signature">Cafes de Carla <span>— Huele, Saborea, Disfruta</span></div>
            </div>
            <div className="story-aside" aria-hidden="true"><span className="sun-shape" /><span className="aside-words serif">despacio<br />sabe mejor</span></div>
          </div>
        </section>


        {/* Sección 2: Carta */}
        <section id="carta" className="menu-section section-wrap" aria-labelledby="menu-title">
          <div className="section-kicker"><span className="eyebrow">02 / PARA DISFRUTAR</span><span className="kicker-line" /></div>
          <div className="menu-heading">
            <div><h2 id="menu-title" className="serif" data-testid="heading-menu">Algo rico,<br /><em>en buena compañía.</em></h2></div>
            <p data-testid="text-menu-introduction">La carta que nos has compartido ya está aquí, con sus productos, descripciones y precios. Los precios no indicados quedan pendientes de confirmar.</p>
          </div>
          <div className="category-list" role="tablist" aria-label="Categorías de la carta" data-testid="menu-category-tabs">
            {menuCategories.map((category, index) => (
              <button key={category.id} type="button" role="tab" aria-selected={activeCategory === category.id} aria-controls="category-panel" className={`category-tab ${activeCategory === category.id ? 'active' : ''}`} onClick={() => setActiveCategory(category.id)} data-testid={`tab-category-${category.id}`}>
                <span className="category-number">{String(index + 1).padStart(2, '0')}</span><span className="category-name">{category.title}</span><ArrowRight size={17} aria-hidden="true" />
              </button>
            ))}
          </div>
          <section className="category-panel" role="tabpanel" id="category-panel" aria-labelledby={`tab-category-${selected.id}`} aria-label={selected.title} data-testid={`panel-category-${selected.id}`}>
            <div className="category-copy">
              <div>
                <span className="eyebrow">EN LA CARTA</span>
                <h3 className="serif" data-testid={`heading-category-${selected.id}`}>{selected.title}</h3>
              </div>
              <p>{selected.note}</p>
            </div>
            {selected.items.length > 0 ? (
              <ul className="product-grid" data-testid={`list-menu-${selected.id}`}>
                {selected.items.map((item) => (
                  <ProductCard key={item.id} item={item} category={selected} onAdd={(size, variant) => changeCartQuantity(item.id, size, 1, variant)} />
                ))}
              </ul>
            ) : (
              <p className="menu-empty" data-testid={`empty-menu-${selected.id}`}>{selected.emptyMessage}</p>
            )}
          </section>
          <p className="menu-disclaimer" data-testid="text-menu-preview-disclosure">Precios transcritos de la carta compartida; los que no figuraban se muestran por confirmar. Las fotos son ilustrativas y se sustituirán por imágenes reales de los productos.</p>
        </section>

        {/* Pausa */}
        <section className="pause-band" aria-label="Eslogan de Cafés de Carla">
          <div className="pause-inner section-wrap"><span className="pause-small">EL PLACER DE HACER UNA COSA A LA VEZ</span><p className="serif">"Cafés de Carla: Huele, Saborea, Disfruta"</p><span className="pause-ornament" aria-hidden="true" /></div>
        </section>


{/* Sección 3: Visítanos - 03 / CUANDO QUIERAS */}
        <section className="visit-section section-wrap" id="visitanos" aria-labelledby="visit-title">
          <div className="section-kicker"><span className="eyebrow">03 / CUANDO QUIERAS</span><span className="kicker-line" /></div>
          <div className="visit-heading">
            <h2 id="visit-title" className="serif" data-testid="heading-visit">La mesa está<br /><em>por poner.</em></h2>
            <p data-testid="text-visit-introduction">Queremos que encontrar Cafés de Carla sea fácil. Estamos preparando esta información con los datos oficiales del negocio.</p>
          </div>
          <div className="visit-grid">
            <div className="map-placeholder" role="img" aria-label="Mapa pendiente de añadir cuando se confirme la dirección" data-testid="map-preview-placeholder">
              <div className="map-pattern" aria-hidden="true" />
              <div className="map-card"><span className="map-pin"><MapPin size={18} /></span><div><strong>El mapa viene pronto</strong><p>Añadiremos la ubicación exacta al confirmar la dirección.</p></div></div>
              <span className="map-label">VISTA PREVIA · SIN UBICACIÓN REAL</span>
            </div>
            <div className="visit-details">
              <article className="detail-block"><span className="detail-icon"><MapPin size={17} /></span><div><span className="eyebrow">DÓNDE ENCONTRARNOS</span><h3>Dirección</h3><p data-testid="text-address-placeholder" className="text-sm text-[#8a7a69]"><strong className="text-[#4a3322] font-serif">Centro histórico</strong> · Confirmación próxima</p></div></article>
              <article className="detail-block"><span className="detail-icon"><Clock3 size={17} /></span><div><span className="eyebrow">PARA TU PRÓXIMA PAUSA</span><h3>Horario</h3><p data-testid="text-hours-placeholder" className="text-sm text-[#8a7a69]"><strong className="text-[#4a3322] font-serif">Lun — Dom</strong> · Confirmación próxima</p></div></article>
              <div className="contact-box" id="contacto">
                <span className="eyebrow">ESTAMOS AQUÍ PARA AYUDAR</span>
                <p>Los datos directos de contacto estarán disponibles en cuanto los confirme el equipo de Cafés de Carla.</p>
                <div className="contact-placeholders">
                  <span className="contact-placeholder"><Phone size={15} /> Contacto — Confirmación próxima</span>
                  <span className="contact-placeholder"><span className="whatsapp-mark">W</span> WhatsApp — Confirmación próxima</span>
                </div>
                <span className="contact-footnote">No se muestran enlaces hasta confirmar los números oficiales.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 4: Social */}
        <section className="social-section" aria-labelledby="social-title">
          <div className="section-wrap social-inner">
            <div className="social-copy"><span className="eyebrow">04 / UN POQUITO MÁS CERCA</span><h2 id="social-title" className="serif">Lo que pasa<br /><em>al otro lado.</em></h2><p>Pronto podrás asomarte a nuestro día a día.</p><span className="social-handle"><Instagram size={17} /> Cuenta de Instagram — Confirmación próxima</span></div>
            <div className="social-grid" data-testid="instagram-feed-placeholder" aria-label="Vista previa del feed de Instagram, aún sin publicaciones">
              <div className="social-tile tile-one"><span className="tile-ring" /><span className="tile-text serif">un café<br />y un respiro</span><small>MUESTRA DE DISEÑO</small></div>
              <div className="social-tile tile-two"><span className="tile-square" /><span className="tile-text serif">a tu<br />ritmo</span><small>MUESTRA DE DISEÑO</small></div>
              <div className="social-tile tile-three"><img src="/sample-coffee.jpg" alt="Imagen ilustrativa de café, no corresponde a la cuenta real de Instagram" loading="lazy" width="640" height="640" data-testid="img-sample-hero" /><span className="tile-overlay">FOTOGRAFÍA DE MUESTRA</span></div>
              <div className="feed-overlay"><Instagram size={20} /><span>El feed aparecerá aquí<br />cuando tengamos la cuenta</span></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main section-wrap">
          <a href="#inicio" className="footer-brand focus-ring" aria-label="Volver al inicio" data-testid="link-footer-home"><img src={logo} alt="Logotipo de Cafés de Carla" width="1024" height="1024" loading="lazy" /><span className="serif">Cafés de Carla</span></a>
          <p className="footer-tagline serif">Huele, Saborea, Disfruta.</p>
          <a className="back-top" href="#inicio" data-testid="link-back-to-top">Volver arriba <ArrowUpRight size={15} /></a>
        </div>
        <div className="footer-bottom section-wrap"><span>© Cafés de Carla</span><span>PREVISUALIZACIÓN DE PRUEBA · NO PUBLICAR</span><span>Hecho para disfrutar sin prisa.</span></div>
      </footer>

      {/* Cart Drawer - only rendered when open */}
      {cartOpen && (
        <>
          <button className="cart-backdrop" type="button" aria-label="Cerrar carrito" onClick={() => setCartOpen(false)} data-testid="button-close-cart-backdrop" />
          <aside ref={cartDrawerRef} className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" tabIndex={-1} data-testid="panel-cart">
            <div className="cart-header">
              <div><span className="eyebrow">TU SELECCIÓN</span><h2 className="serif" id="cart-title">Tu carrito</h2></div>
              <button ref={cartCloseRef} className="cart-close focus-ring" type="button" aria-label="Cerrar carrito" onClick={() => setCartOpen(false)} data-testid="button-close-cart"><X size={20} /></button>
            </div>
            {cartLines.length === 0 && mesaActiva && orderItemsFromStorage.length > 0 ? (
              <>
                <div className="cart-empty" data-testid="empty-cart">
                  <ShoppingBag size={28} aria-hidden="true" />
                  {orderStatus === 'served' ? (
                    <p>Tu pedido está listo para pagar.</p>
                  ) : orderStatus === 'paid' ? (
                    <p>Tu pedido ya está pagado.</p>
                  ) : (
                    <p>Tu pedido ya fue enviado a cocina.</p>
                  )}
                  <p style={{ fontSize: '12px', color: '#7c6f5e', marginTop: '8px' }}>
                    Puedes seguir agregando más productos o completar el pago.
                  </p>
                  <a className="text-cta focus-ring" href="#carta" onClick={() => setCartOpen(false)} data-testid="link-cart-to-menu">Seguir pidiendo <ArrowDown size={15} /></a>
                </div>

                <div className="cart-footer" style={{ marginTop: '20px' }}>
                  <div style={{ fontSize: '14px', color: '#7c6f5e', marginBottom: '16px' }}>
                    <strong>Estado:</strong>{' '}
                    {orderStatus === 'pending' ? 'Pendiente' : orderStatus === 'confirmed' ? 'Confirmado' : orderStatus === 'served' ? 'Servido' : orderStatus === 'paid' ? 'Pagado' : ''}
                  </div>
                  <div style={{ borderTop: '1px solid #ddd1bd', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <span>Items en cocina</span>
                      <strong>{formatPrice(orderItemsFromStorage.reduce((s, i) => s + i.priceCents * i.quantity, 0))}</strong>
                    </div>
                    {orderStatus === 'served' && (
                      <button
                        className="cart-checkout focus-ring stripe-btn" type="button" onClick={payTableBill} data-testid="button-pay-table"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}
                      >
                        <CreditCard size={18} aria-hidden="true" />
                        <span>Pagar cuenta</span>
                      </button>
                    )}
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
                  </div>
                </div>
              </>
            ) : cartLines.length === 0 ? (
              <div className="cart-empty" data-testid="empty-cart">
                <ShoppingBag size={28} aria-hidden="true" />
                <p>Tu carrito todavía está vacío.</p>
                <a className="text-cta focus-ring" href="#carta" onClick={() => setCartOpen(false)} data-testid="link-cart-to-menu">Volver a la carta <ArrowDown size={15} /></a>
              </div>
            ) : (
              <>
                <ul className="cart-lines" data-testid="list-cart-items">
                  {cartLines.map((line) => {
                    const item = menuItemsById.get(line.itemId);
                    const price = item?.sizes?.find((s: any) => s.label === line.sizeLabel)?.priceCents ?? item?.priceCents ?? 0;
                    return (
                      <li className="cart-line" key={`${line.itemId}|${line.sizeLabel}`} data-testid={`cart-item-${line.itemId}-${line.sizeLabel}`}>
                        <div className="cart-line-main">
                          <div>
                            <h3 data-testid={`cart-name-${line.itemId}`}>{item?.name ?? line.itemId}</h3>
                            <span className={price === 0 ? 'cart-price-pending' : 'cart-line-price'} data-testid={`cart-price-${line.itemId}`}>
                              {price === 0 ? 'Precio por confirmar' : formatPrice(price * line.quantity)}
                            </span>
                          </div>
                          <div className="cart-quantity-controls" role="group" aria-label={`Cantidad de ${item?.name ?? line.itemId}`}>
                            <button className="quantity-button focus-ring" type="button" aria-label={`Quitar una unidad de ${item?.name ?? line.itemId}`} onClick={() => changeCartQuantity(line.itemId, line.sizeLabel, -1)} data-testid={`button-remove-one-${line.itemId}`}><Minus size={14} /></button>
                            <span className="quantity-value" data-testid={`text-quantity-${line.itemId}`}>{line.quantity}</span>
                            <button className="quantity-button focus-ring" type="button" aria-label={`Añadir una unidad de ${item?.name ?? line.itemId}`} onClick={() => changeCartQuantity(line.itemId, line.sizeLabel, 1)} data-testid={`button-add-one-${line.itemId}`}><Plus size={14} /></button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', gap: '8px' }}>
                          <span style={{ fontSize: '11px', color: '#7c6f5e' }}>{line.sizeLabel}{line.variant ? ` · ${line.variant}` : ''}</span>
                          <button style={{ background: 'none', border: 'none', color: '#948675', fontSize: '10px', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => removeFromCart(line.itemId, line.sizeLabel)}>Eliminar</button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            <div className="cart-footer">
              {!allPriced && cartLines.length > 0 && <p className="cart-partial-note" role="note" data-testid="text-cart-partial-total">El total es parcial: hay productos sin precio indicado en la carta.</p>}
              <div className="cart-total" data-testid="text-cart-total"><span>{allPriced ? 'Subtotal' : 'Subtotal parcial'}</span><strong>{formatPrice(tableTotalCents)}</strong></div>
              {mesaActiva ? (
                <>
                  {cartLines.length > 0 ? (
                    <>
                      {orderStatus === 'served' ? (
                        <>
                          <p className="cart-preview-note" style={{ color: '#6b7d4c', fontWeight: 700, marginBottom: '12px' }}>
                            Tu pedido anterior está servido · Puedes pagar o agregar más
                          </p>
                        </>
                      ) : orderStatus === 'paid' ? (
                        <>
                          <p className="cart-preview-note" style={{ color: '#6b7d4c', fontWeight: 700, marginBottom: '12px' }}>
                            Pedido anterior pagado ✓ · Puedes seguir pidiendo
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="cart-preview-note" style={{ color: '#7c6f5e', fontSize: '11px', marginBottom: '12px' }}>
                            Tu pedido ya fue enviado a cocina. Puedes agregar más items.
                          </p>
                        </>
                      )}
                      <button
                        className="cart-checkout focus-ring stripe-btn" type="button" onClick={sendToKitchen} disabled={!allPriced} data-testid="button-add-more-kitchen"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', background: '#6b7d4c', borderColor: '#6b7d4c' }}
                      >
                        <span style={{ fontSize: '18px', marginRight: '6px' }}>🍽️</span>
                        <span>Agregar más a cocina — {formatPrice(tableTotalCents)}</span>
                      </button>
                      {orderStatus === 'served' && (
                        <button
                          className="cart-checkout focus-ring stripe-btn" type="button" onClick={payTableBill} data-testid="button-pay-table"
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', marginTop: '10px' }}
                        >
                          <CreditCard size={18} aria-hidden="true" />
                          <span>Pagar cuenta — {formatPrice(tableTotalCents)}</span>
                        </button>
                      )}
                      <button className="cart-clear focus-ring" type="button" onClick={() => setCart({})} data-testid="button-clear-cart">Vaciar carrito</button>
                    </>
                  ) : (
                    <>
                      {orderStatus === 'served' && (
                        <>
                          <p className="cart-preview-note" style={{ color: '#6b7d4c', fontWeight: 700, marginBottom: '12px' }}>
                            Tu pedido está servido · Puedes pagar ahora
                          </p>
                          <button
                            className="cart-checkout focus-ring stripe-btn" type="button" onClick={payTableBill} data-testid="button-pay-table"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}
                          >
                            <CreditCard size={18} aria-hidden="true" />
                            <span>Pagar cuenta</span>
                          </button>
                        </>
                      )}
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
                    className="cart-checkout focus-ring stripe-btn" type="button" onClick={checkout} disabled={!allPriced} data-testid="button-checkout"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <CreditCard size={18} aria-hidden="true" />
                    <span>Terminar pedido — {formatPrice(cartSubtotal)}</span>
                  </button>
                  <button className="cart-clear focus-ring" type="button" onClick={() => setCart({})} data-testid="button-clear-cart">Vaciar carrito</button>
                </>
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route path="/success" component={Success} /><Route path="/cocina" component={Cocina} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}><TooltipProvider><Toaster position="bottom-center" /><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter></TooltipProvider></QueryClientProvider>
  );
}

export default App;