import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Clock3, CreditCard, Instagram, MapPin, Menu as MenuIcon, Minus, Phone, Plus, ShoppingBag, X } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Success from '@/pages/success';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { menuCategories } from './data/menu';

const queryClient = new QueryClient();
const logo = '/cafes-de-carla-logo.jpg';

const menuItemsById = new Map(
  menuCategories.flatMap((category) => category.items).map((item) => [item.id, item] as const),
);
const menuItemCategoryById = new Map(
  menuCategories.flatMap((category) => category.items.map((item) => [item.id, category.id] as const)),
);

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

function priceForSize(item: { sizes: Array<{ label: string; priceCents: number }> }, size: string): number {
  const s = item.sizes.find((x) => x.label === size);
  return s ? s.priceCents : item.sizes[0]?.priceCents ?? 0;
}

function ProductCard({ item, category, onAdd }: { item: any; category: any; onAdd: () => void }) {
  const [selectedSize, setSelectedSize] = useState(item.defaultSize);
  const [selectedVariant, setSelectedVariant] = useState(item.defaultVariant ?? null);

  const currentPrice = priceForSize(item, selectedSize);
  const hasSizes = item.sizes.length > 1;
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
            {formatPrice(currentPrice)}
          </span>
          <button className="add-to-cart focus-ring" type="button" aria-label={`Añadir ${item.name} al carrito`} onClick={onAdd} data-testid={`button-add-menu-${item.id}`}>
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
  const cartTriggerRef = useRef<HTMLButtonElement>(null);
  const cartCloseRef = useRef<HTMLButtonElement>(null);
  const cartDrawerRef = useRef<HTMLElement>(null);
  const selected = menuCategories.find((category) => category.id === activeCategory) ?? menuCategories[0];

  const cartLines = Object.values(cart);
  const cartCount = cartLines.reduce((total, line) => total + line.quantity, 0);
  const cartSubtotal = cartLines.reduce((total, line) => {
    const item = menuItemsById.get(line.itemId);
    const price = item ? priceForSize(item, line.sizeLabel) : 0;
    return total + price * line.quantity;
  }, 0);
  const allPriced = cartLines.length > 0 && cartLines.every((line) => {
    const item = menuItemsById.get(line.itemId);
    return Boolean(item && priceForSize(item, line.sizeLabel) > 0);
  });

  const closeNav = () => setMobileOpen(false);
  const cartKey = (itemId: string, sizeLabel: string) => `${itemId}|${sizeLabel}`;

  const changeCartQuantity = (itemId: string, sizeLabel: string, adjustment: number) => {
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
        next[key] = { itemId, quantity, sizeLabel, variant: existing?.variant ?? null };
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
        return {
          id: line.itemId,
          quantity: line.quantity,
          sizeLabel: line.sizeLabel,
          variant: line.variant ?? undefined,
          priceCents: item ? priceForSize(item, line.sizeLabel) : 0,
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
        return {
          name: item?.name ?? line.itemId,
          qty: line.quantity,
          sizeLabel: line.sizeLabel,
          variant: line.variant ?? undefined,
          priceCents: item ? priceForSize(item, line.sizeLabel) : 0,
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

  useEffect(() => {
    if (!cartOpen) return;

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

      {/* Header */}
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
            <X size={17} aria-hidden="true" />
          </button>
        </div>
      </header>

      <main>
        {/* Sección 1: Héroe - usando clases CSS originales */}
        <section id="inicio" className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="hero-overline">
              <span className="eyebrow">UN RINCÓN PARA BAJAR EL RITMO</span>
            </div>
            <h1 id="hero-title" className="serif" data-testid="heading-hero">Huele.<br /><em className="text-[#738e4d]">Saborea.</em><br />Disfruta.</h1>
            <p className="hero-description" data-testid="text-hero-intro">Un café preparado con cariño. Un ratito para ti. En Cafés de Carla, cada pausa merece saberse.</p>
            <button className="text-cta focus-ring" onClick={() => setActiveCategory('carta')}>
              Descubre la carta
              <span><ArrowDown size={16} aria-hidden="true" /></span>
            </button>
            <div className="hero-footnote">
              <span>CAFÉS DE CARLA</span>
              <span>UNA PAUSA, A TU RITMO</span>
              <span>CD</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-photo">
              <img src="/sample-coffee.jpg" alt="Café de especialidad con croissant" width="600" height="600" data-testid="img-hero" />
            </div>
            <div className="photo-stamp"><span>momento</span><strong>para ti</strong></div>
            <div className="hero-side-note">tómate el<br />tiempo<br />también<br />sabe.</div>
          </div>
        </section>

        {/* Sección 2: Carta */}
        <section id="carta" className="menu-section section-wrap" aria-labelledby="menu-title">
          <div className="section-kicker"><span className="eyebrow">02 / PARA DISFRUTAR</span><span className="kicker-line" /></div>
          <div className="menu-heading">
            <div><h2 id="menu-title" className="serif" data-testid="heading-menu">Algo rico,<br /><em>en buena compañía.</em></h2></div>
            <p data-testid="text-menu-introduction">La carta de Cafés de Carla con sus productos, tamaños y precios. Elige tu opción y añádela al carrito.</p>
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
                  <ProductCard key={item.id} item={item} category={selected} onAdd={() => changeCartQuantity(item.id, item.defaultSize, 1)} />
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
          <div className="pause-inner section-wrap"><span className="pause-small">EL PLACER DE HACER UNA COSA A LA VEZ</span><p className="serif">“Cafés de Carla: Huele, Saborea, Disfruta”</p><span className="pause-ornament" aria-hidden="true" /></div>
        </section>

        {/* Sección 3: Nuestra esencia - usando clases CSS originales */}
        <section className="story-section" id="visitanos" aria-labelledby="visit-title">
          <div className="story-grid">
            <div className="story-aside"><div className="sun-shape" /><div className="aside-words">despacio<br />sabe<br />mejor</div></div>
            <div className="story-content">
              <h2 id="visit-title" className="serif" data-testid="heading-visit">Hay días que piden<br /><em>una pausa bonita.</em></h2>
              <div className="story-bottom">
                <p>En Cafés de Carla creemos en el placer sencillo de parar un momento. En el aroma que llega antes del primer sorbo, en algo rico sobre la mesa y en sentirse bien recibido.</p>
              </div>
              <div className="story-signature">Cafés de Carla <span>— Huele, Saborea, Disfruta</span></div>
            </div>
          </div>
        </section>

        {/* Sección 4: Social / Instagram - usando clases CSS originales */}
        <section className="social-section" aria-labelledby="social-title">
          <div className="social-inner">
            <div className="social-copy">
              <span className="eyebrow">04 / UN POQUITO MÁS CERCA</span>
              <h2 id="social-title" className="serif" data-testid="heading-social">Lo que pasa<br /><em>al otro lado.</em></h2>
              <p>Pronto podrás asomarte a nuestro día a día.</p>
              <span className="social-handle"><Instagram size={17} /> Cuenta de Instagram pendiente de confirmar</span>
            </div>
            <div className="social-grid" data-testid="instagram-feed-placeholder" aria-label="Vista previa del feed de Instagram, aún sin publicaciones">
              <div className="social-tile tile-one"><span className="tile-ring" /><span className="tile-text serif">un café<br />y un respiro</span><small>MUESTRA DE DISEÑO</small></div>
              <div className="social-tile tile-two"><span className="tile-square" /><span className="tile-text serif">a tu<br />ritmo</span><small>MUESTRA DE DISEÑO</small></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <img src={logo} alt="Cafés de Carla" width="64" height="64" />
            <span>Cafés de Carla</span>
          </div>
          <p className="footer-tagline">Huele, Saborea, Disfruta.</p>
          <a href="/" className="back-top">Volver arriba <ArrowUpRight size={14} aria-hidden="true" /></a>
        </div>
        <div className="footer-bottom">
          <span>Cafés de Carla</span>
          <span>PREVISUALIZACIÓN DE PRUEBA · NO PUBLICAR</span>
          <span>Hecho para disfrutar el café</span>
        </div>
      </footer>

      {/* Cart Drawer - only rendered when open */}
      {cartOpen && (
        <>
          <div className="cart-backdrop" onClick={() => setCartOpen(false)} />
          <div className="cart-drawer" ref={cartDrawerRef} role="dialog" aria-modal="true" aria-labelledby="cart-title">
            <div className="cart-header">
              <div>
                <span className="eyebrow">TU SELECCIÓN</span>
                <h2 id="cart-title">Tu carrito</h2>
              </div>
              <button className="cart-close" onClick={() => setCartOpen(false)}>✕</button>
            </div>
            <div className="cart-items" data-testid="cart-items-list">
              {cartLines.length === 0 ? (
                <div className="cart-empty">
                  <div className="cart-empty-icon">🛒</div>
                  <p>Tu carrito todavía está vacío.</p>
                  <button className="focus-ring" onClick={() => setCartOpen(false)}>
                    Volver a la carta <ArrowDown size={16} aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <ul className="cart-list">
                  {cartLines.map((line) => {
                    const item = menuItemsById.get(line.itemId);
                    const price = item ? priceForSize(item, line.sizeLabel) : 0;
                    return (
                      <li key={`${line.itemId}|${line.sizeLabel}`} className="cart-list-item" data-testid={`cart-item-${line.itemId}-${line.sizeLabel}`}>
                        <div className="cart-item-info">
                          <strong>{item?.name ?? line.itemId}</strong>
                          <span className="cart-item-size">{line.sizeLabel}{line.variant ? ` · ${line.variant}` : ''}</span>
                        </div>
                        <div className="cart-item-controls">
                          <div className="cart-item-qty">
                            <button className="cart-qty-btn" onClick={() => changeCartQuantity(line.itemId, line.sizeLabel, -1)}>−</button>
                            <span>{line.quantity}</span>
                            <button className="cart-qty-btn" onClick={() => changeCartQuantity(line.itemId, line.sizeLabel, 1)}>+</button>
                          </div>
                          <span className="cart-item-price">{formatPrice(price * line.quantity)}</span>
                          <button className="cart-remove" onClick={() => removeFromCart(line.itemId, line.sizeLabel)}>Eliminar</button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="cart-footer">
              <div className="cart-subtotal">
                <span>Subtotal</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>
              <button className="cart-checkout focus-ring stripe-btn" type="button" onClick={checkout} disabled={!allPriced} data-testid="button-checkout">
                <CreditCard size={18} aria-hidden="true" />
                <span>Terminar pedido — {formatPrice(cartSubtotal)}</span>
              </button>
              {!allPriced && cartLines.length > 0 && <p className="cart-disclaimer">Algunos productos no tienen precio definido.</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Router() {
  return <WouterRouter><Switch><Route path="/" component={Home} /><Route path="/success" component={Success} /><Route component={NotFound} /></Switch></WouterRouter>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary resetKey="/">{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster position="bottom-center" />
        <WouterRouter>
          <RoutedErrorBoundary>
            <Router />
          </RoutedErrorBoundary>
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
