import { useState } from 'react';
import { menuCategories } from './data/menu';

function Home() {
  const [activeCategory, setActiveCategory] = useState('featured');
  const selected = menuCategories.find((c) => c.id === activeCategory) ?? menuCategories[0];

  return (
    <div className="site-shell grain min-h-[100dvh]">
      <header className="site-header">
        <div className="header-inner section-wrap">
          <h1>Cafés de Carla</h1>
          <nav className="main-nav" aria-label="Navegación principal">
            {menuCategories.map((category, index) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
              >
                {String(index + 1).padStart(2, '0')} {category.title}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main>
        <section id="carta" className="menu-section section-wrap">
          <h2>{selected.title}</h2>
          <p>{selected.note}</p>
          <ul className="product-grid">
            {selected.items.map((item) => (
              <li key={item.id} className="product-card">
                <h4>{item.name}</h4>
                <p>{item.description ?? ''}</p>
                <span>{item.sizes.map((s) => `${s.label}: ${(s.priceCents / 100).toFixed(2)} €`).join(' | ')}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return <Home />;
}
