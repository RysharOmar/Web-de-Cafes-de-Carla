import { useState } from 'react';
import { Plus, ShoppingBag } from 'lucide-react';
import { menuCategories } from './menu';
import './_group.css';

function mockImagePath(image: string | null) {
  return image ? `/__mockup/images/${image.split('/').pop()}` : null;
}

export function ProductCards() {
  const [activeCategory, setActiveCategory] = useState('featured');
  const [cartCount, setCartCount] = useState(0);
  const selected = menuCategories.find((category) => category.id === activeCategory) ?? menuCategories[0];
  const selectedImage = mockImagePath(selected.image) ?? '/__mockup/images/sample-brunch.jpg';

  return (
    <main className="cafe-menu-stage">
      <div className="cafe-menu-inner">
        <div className="cafe-menu-topline">
          <span>02 / Para disfrutar</span>
          <span className="menu-preview-cart"><ShoppingBag size={15} aria-hidden="true" /> Carrito <strong>{cartCount}</strong></span>
        </div>
        <header className="cafe-menu-heading">
          <h1>Algo rico,<br /><em>en buena compañía.</em></h1>
          <p>Elige algo rico y añádelo a tu carrito. Las fotos son ilustrativas y los datos pendientes están señalados.</p>
        </header>

        <nav className="product-category-strip" role="tablist" aria-label="Categorías de la carta">
          {menuCategories.map((category, index) => (
            <button key={category.id} type="button" role="tab" aria-selected={activeCategory === category.id} aria-controls={`product-panel-${category.id}`} className={`product-category-tab ${activeCategory === category.id ? 'active' : ''}`} onClick={() => setActiveCategory(category.id)}>
              <span className="product-category-number">{String(index + 1).padStart(2, '0')}</span>{category.title}
            </button>
          ))}
        </nav>

        <section id={`product-panel-${selected.id}`} role="tabpanel" aria-label={selected.title}>
          <header className="product-category-heading">
            <h2>{selected.title}</h2>
            <p>{selected.note}</p>
          </header>
          {selected.items.length > 0 ? (
            <ul className="product-grid">
              {selected.items.map((item) => (
                <li className="product-card" key={item.id}>
                  <div className="product-card-photo">
                    <img src={selectedImage} alt={`Foto ilustrativa; no es una fotografía real de ${item.name}`} loading="lazy" width="960" height="720" />
                    <span className="product-photo-badge">IMAGEN DE MUESTRA</span>
                  </div>
                  <div className="product-card-content">
                    <h3>{item.name}</h3>
                    <p>{item.description ?? 'Detalles por confirmar'}</p>
                    <div className="product-card-footer">
                      <span className={`product-card-price ${item.price ? '' : 'pending'}`}>{item.price ?? 'Precio por confirmar'}</span>
                      <button className="product-add-button" type="button" aria-label={`Añadir ${item.name} al carrito`} onClick={() => setCartCount((count) => count + 1)}><Plus size={15} aria-hidden="true" />Añadir</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="menu-empty-message">{selected.emptyMessage}</p>
          )}
        </section>
        <p className="product-menu-disclaimer">Precios transcritos de la carta; los no indicados quedan por confirmar. Las imágenes son de muestra y se sustituirán por fotografías reales.</p>
      </div>
    </main>
  );
}
