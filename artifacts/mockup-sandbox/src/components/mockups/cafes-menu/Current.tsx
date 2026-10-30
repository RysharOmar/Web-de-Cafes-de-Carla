import { useState } from 'react';
import { ArrowRight, Plus, ShoppingBag } from 'lucide-react';
import { menuCategories } from './menu';
import './_group.css';

function mockImagePath(image: string | null) {
  return image ? `/__mockup/images/${image.split('/').pop()}` : null;
}

export function Current() {
  const [activeCategory, setActiveCategory] = useState('featured');
  const [cartCount, setCartCount] = useState(0);
  const selected = menuCategories.find((category) => category.id === activeCategory) ?? menuCategories[0];
  const selectedImage = mockImagePath(selected.image);

  return (
    <main className="cafe-menu-stage">
      <div className="cafe-menu-inner">
        <div className="cafe-menu-topline">
          <span>02 / Para disfrutar</span>
          <span className="menu-preview-cart"><ShoppingBag size={15} aria-hidden="true" /> Carrito <strong>{cartCount}</strong></span>
        </div>
        <header className="cafe-menu-heading">
          <h1>Algo rico,<br /><em>en buena compañía.</em></h1>
          <p>La carta que nos has compartido ya está aquí, con sus productos, descripciones y precios. Los precios no indicados quedan pendientes de confirmar.</p>
        </header>
        <div className="current-menu-layout">
          <div className="current-category-list" role="tablist" aria-label="Categorías de la carta">
            {menuCategories.map((category, index) => (
              <button key={category.id} type="button" role="tab" aria-selected={activeCategory === category.id} aria-controls="current-category-panel" className={`current-category-tab ${activeCategory === category.id ? 'active' : ''}`} onClick={() => setActiveCategory(category.id)}>
                <span className="current-category-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="current-category-name">{category.title}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            ))}
          </div>
          <section className="current-category-panel" role="tabpanel" id="current-category-panel" aria-label={selected.title}>
            <div className="current-category-top">
              {selectedImage && (
                <div className="current-category-art">
                  <img src={selectedImage} alt={selected.alt} loading="lazy" width="960" height="720" />
                  <span className="sample-flag">IMAGEN DE MUESTRA</span>
                </div>
              )}
              <div className="current-category-copy">
                <span className="menu-eyebrow">En la carta</span>
                <h2>{selected.title}</h2>
                <p>{selected.note}</p>
              </div>
            </div>
            {selected.items.length > 0 ? (
              <ul className="current-menu-items">
                {selected.items.map((item) => (
                  <li className="current-menu-item" key={item.id}>
                    <div>
                      <h3>{item.name}</h3>
                      {item.description && <p>{item.description}</p>}
                    </div>
                    <div>
                      <span className="current-menu-price">{item.price ?? 'Precio por confirmar'}</span>
                      <button className="current-add-button" type="button" aria-label={`Añadir ${item.name}`} onClick={() => setCartCount((count) => count + 1)}><Plus size={13} aria-hidden="true" />Añadir</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="menu-empty-message">{selected.emptyMessage}</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
