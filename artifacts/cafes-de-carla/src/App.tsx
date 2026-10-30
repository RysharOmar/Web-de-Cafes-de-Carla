import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Clock3, Instagram, MapPin, Menu as MenuIcon, Minus, Phone, Plus, ShoppingBag, X } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { menuCategories } from './data/menu';

const queryClient = new QueryClient();
const logo = '/cafes-de-carla-logo.jpg';
const menuItemsById = new Map(menuCategories.flatMap((category) => category.items).map((item) => [item.id, item] as const));
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
      ecommerce: {
        items: [{ item_id: itemId, item_category: categoryId }],
      },
    });
  } catch {
    // Analytics must never interrupt the cart interaction.
  }
}

function priceInCents(price?: string) {
  if (!price) return null;
  const amount = Number(price.replace('€', '').trim().replace(',', '.'));
  return Number.isFinite(amount) ? Math.round(amount * 100) : null;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

function Home() {
  const [activeCategory, setActiveCategory] = useState('featured');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const selected = menuCategories.find((category) => category.id === activeCategory) ?? menuCategories[0];
  const cartTriggerRef = useRef<HTMLButtonElement>(null);
  const cartCloseRef = useRef<HTMLButtonElement>(null);
  const cartDrawerRef = useRef<HTMLElement>(null);
  const cartLines = Object.entries(cart).flatMap(([id, quantity]) => {
    const item = menuItemsById.get(id);
    return item ? [{ item, quantity }] : [];
  });
  const cartCount = cartLines.reduce((total, line) => total + line.quantity, 0);
  const cartSubtotal = cartLines.reduce((total, line) => total + (priceInCents(line.item.price) ?? 0) * line.quantity, 0);
  const hasUnpricedItems = cartLines.some((line) => priceInCents(line.item.price) === null);
  const allPriced = !hasUnpricedItems && cartLines.length > 0;
  const closeNav = () => setMobileOpen(false);

  const checkout = async () => {
    if (!allPriced) return;

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartLines.map(({ item, quantity }) => ({
            id: item.id,
            quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Error al crear la sesión de pago");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      alert("No se pudo preparar el pago. Inténtalo de nuevo.");
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

  const changeCartQuantity = (itemId: string, adjustment: number) => {
    if (adjustment > 0) {
      const categoryId = menuItemCategoryById.get(itemId);
      if (categoryId) trackCartAdd(itemId, categoryId);
    }

    setCart((current) => {
      const next = { ...current };
      const quantity = (next[itemId] ?? 0) + adjustment;
      if (quantity <= 0) delete next[itemId];
      else next[itemId] = quantity;
      return next;
    });
  };

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

      <main>
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

        <section id="historia" className="story-section" aria-labelledby="story-title">
          <div className="section-wrap story-grid">
            <div className="story-marker"><span className="eyebrow">01 / NUESTRA ESENCIA</span><span className="marker-line" /></div>
            <div className="story-content">
              <h2 className="serif" id="story-title" data-testid="heading-brand-story">Hay días que piden<br /><em>una pausa bonita.</em></h2>
              <div className="story-bottom">
                <p data-testid="text-brand-story-first">En Cafés de Carla creemos en el placer sencillo de parar un momento. En el aroma que llega antes del primer sorbo, en algo rico sobre la mesa y en sentirte bien recibido.</p>
                <p data-testid="text-brand-story-second">Una invitación abierta a venir como eres, elegir lo que te apetece y disfrutar sin mirar el reloj.</p>
              </div>
              <div className="story-signature">Cafés de Carla <span>— Huele, Saborea, Disfruta</span></div>
            </div>
            <div className="story-aside" aria-hidden="true"><span className="sun-shape" /><span className="aside-words serif">despacio<br />sabe mejor</span></div>
          </div>
        </section>

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
                  <li className="product-card" key={item.id} data-testid={`item-menu-${item.id}`}>
                    <div className="product-photo">
                      <img
                        src={selected.image ?? '/sample-brunch.jpg'}
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
                      <div className="product-card-footer">
                        <span className={`product-card-price ${item.price ? '' : 'price-pending'}`} data-testid={`price-menu-${item.id}`}>
                          {item.price ?? 'Precio por confirmar'}
                        </span>
                        <button className="add-to-cart focus-ring" type="button" aria-label={`Añadir ${item.name} al carrito`} onClick={() => changeCartQuantity(item.id, 1)} data-testid={`button-add-menu-${item.id}`}>
                          <Plus size={15} aria-hidden="true" /><span>Añadir</span>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="menu-empty" data-testid={`empty-menu-${selected.id}`}>{selected.emptyMessage}</p>
            )}
          </section>
          <p className="menu-disclaimer" data-testid="text-menu-preview-disclosure">Precios transcritos de la carta compartida; los que no figuraban se muestran por confirmar. Las fotos son ilustrativas y se sustituirán por imágenes reales de los productos.</p>
        </section>

        <section className="pause-band" aria-label="Eslogan de Cafés de Carla">
          <div className="pause-inner section-wrap"><span className="pause-small">EL PLACER DE HACER UNA COSA A LA VEZ</span><p className="serif">“Cafés de Carla: Huele, Saborea, Disfruta”</p><span className="pause-ornament" aria-hidden="true" /></div>
        </section>

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
              <article className="detail-block"><span className="detail-icon"><MapPin size={17} /></span><div><span className="eyebrow">DÓNDE ENCONTRARNOS</span><h3>Dirección</h3><p data-testid="text-address-placeholder">Dirección pendiente de confirmar</p></div></article>
              <article className="detail-block"><span className="detail-icon"><Clock3 size={17} /></span><div><span className="eyebrow">PARA TU PRÓXIMA PAUSA</span><h3>Horario</h3><p data-testid="text-hours-placeholder">Horario pendiente de confirmar</p></div></article>
              <div className="contact-box" id="contacto">
                <span className="eyebrow">ESTAMOS AQUÍ PARA AYUDAR</span>
                <p>Los datos directos de contacto estarán disponibles en cuanto los confirme el equipo de Cafés de Carla.</p>
                <div className="contact-placeholders">
                  <span className="contact-placeholder"><Phone size={15} /> Teléfono pendiente</span>
                  <span className="contact-placeholder"><span className="whatsapp-mark">W</span> WhatsApp pendiente</span>
                </div>
                <span className="contact-footnote">No se muestran enlaces hasta confirmar los números oficiales.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="social-section" aria-labelledby="social-title">
          <div className="section-wrap social-inner">
            <div className="social-copy"><span className="eyebrow">04 / UN POQUITO MÁS CERCA</span><h2 id="social-title" className="serif">Lo que pasa<br /><em>al otro lado.</em></h2><p>Pronto podrás asomarte a nuestro día a día.</p><span className="social-handle"><Instagram size={17} /> Cuenta de Instagram pendiente de confirmar</span></div>
            <div className="social-grid" data-testid="instagram-feed-placeholder" aria-label="Vista previa del feed de Instagram, aún sin publicaciones">
              <div className="social-tile tile-one"><span className="tile-ring" /><span className="tile-text serif">un café<br />y un respiro</span><small>MUESTRA DE DISEÑO</small></div>
              <div className="social-tile tile-two"><span className="tile-square" /><span className="tile-text serif">a tu<br />ritmo</span><small>MUESTRA DE DISEÑO</small></div>
              <div className="social-tile tile-three"><img src="/sample-coffee.jpg" alt="Imagen ilustrativa de café, no corresponde a la cuenta real de Instagram" loading="lazy" width="640" height="640" /><span className="tile-overlay">FOTOGRAFÍA DE MUESTRA</span></div>
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
      {cartOpen && (
        <>
          <button className="cart-backdrop" type="button" aria-label="Cerrar carrito" onClick={() => setCartOpen(false)} data-testid="button-close-cart-backdrop" />
          <aside ref={cartDrawerRef} className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" tabIndex={-1} data-testid="panel-cart">
            <div className="cart-header">
              <div><span className="eyebrow">TU SELECCIÓN</span><h2 className="serif" id="cart-title">Tu carrito</h2></div>
              <button ref={cartCloseRef} className="cart-close focus-ring" type="button" aria-label="Cerrar carrito" onClick={() => setCartOpen(false)} data-testid="button-close-cart"><X size={20} /></button>
            </div>
            {cartLines.length === 0 ? (
              <div className="cart-empty" data-testid="empty-cart">
                <ShoppingBag size={28} aria-hidden="true" />
                <p>Tu carrito todavía está vacío.</p>
                <a className="text-cta focus-ring" href="#carta" onClick={() => setCartOpen(false)} data-testid="link-cart-to-menu">Volver a la carta <ArrowDown size={15} /></a>
              </div>
            ) : (
              <>
                <ul className="cart-lines" data-testid="list-cart-items">
                  {cartLines.map(({ item, quantity }) => {
                    const itemPrice = priceInCents(item.price);
                    return (
                      <li className="cart-line" key={item.id} data-testid={`cart-item-${item.id}`}>
                        <div className="cart-line-main">
                          <div><h3 data-testid={`cart-name-${item.id}`}>{item.name}</h3><span className={itemPrice === null ? 'cart-price-pending' : 'cart-line-price'} data-testid={`cart-price-${item.id}`}>{itemPrice === null ? 'Precio por confirmar' : formatPrice(itemPrice * quantity)}</span></div>
                          <div className="cart-quantity-controls" role="group" aria-label={`Cantidad de ${item.name}`}>
                            <button className="quantity-button focus-ring" type="button" aria-label={`Quitar una unidad de ${item.name}`} onClick={() => changeCartQuantity(item.id, -1)} data-testid={`button-remove-one-${item.id}`}><Minus size={14} /></button>
                            <span className="quantity-value" data-testid={`text-quantity-${item.id}`}>{quantity}</span>
                            <button className="quantity-button focus-ring" type="button" aria-label={`Añadir una unidad de ${item.name}`} onClick={() => changeCartQuantity(item.id, 1)} data-testid={`button-add-one-${item.id}`}><Plus size={14} /></button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="cart-footer">
                  {hasUnpricedItems && <p className="cart-partial-note" role="note" data-testid="text-cart-partial-total">El total es parcial: hay productos sin precio indicado en la carta.</p>}
                  <div className="cart-total" data-testid="text-cart-total"><span>{hasUnpricedItems ? 'Subtotal parcial' : 'Subtotal'}</span><strong>{formatPrice(cartSubtotal)}</strong></div>
                  <p className="cart-preview-note">Carrito de vista previa: no se envían pedidos ni se procesan pagos.</p>
                  <button
                    className="cart-checkout focus-ring"
                    type="button"
                    onClick={checkout}
                    disabled={!allPriced}
                    data-testid="button-checkout"
                  >
                    Pagar con Stripe
                  </button>
                  <button className="cart-clear focus-ring" type="button" onClick={() => setCart({})} data-testid="button-clear-cart">Vaciar carrito</button>
                </div>
              </> 
            )}
          </aside>
        </>
      )}
    </div>
  );
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
