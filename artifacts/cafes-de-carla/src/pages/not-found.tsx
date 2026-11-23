import { ArrowLeft, ArrowRight, Coffee, MapPin } from 'lucide-react';
import LegalLinks from '@/components/legal-links';

export default function NotFound() {
  return (
    <div className="site-shell grain notfound-shell">
      <header className="site-header">
        <div className="header-inner section-wrap">
          <a href="/" className="text-cta focus-ring" data-testid="button-back-home">
            <ArrowLeft size={15} aria-hidden="true" /> Volver a la carta
          </a>
          <div style={{ flex: 1 }} />
          <span className="serif" style={{ fontSize: '20px', color: '#4a3322' }}>Cafés de Carla</span>
          <div style={{ flex: 1 }} />
          <span className="eyebrow" style={{ color: '#83915f' }}>Ups…</span>
        </div>
      </header>

      <main className="section-wrap notfound-main">
        <div className="notfound-card">
          <div className="notfound-illustration" aria-hidden="true">
            <span className="notfound-number serif">404</span>
            <span className="notfound-cup"><Coffee size={46} strokeWidth={1.4} /></span>
            <span className="notfound-steam notfound-steam--one" />
            <span className="notfound-steam notfound-steam--two" />
          </div>

          <span className="eyebrow">ESTA RUTA NO EXISTE</span>
          <h1 className="serif notfound-title">Se nos ha derramado<br /><em>el camino.</em></h1>
          <p className="notfound-copy">
            La página que buscas no está aquí, se ha movido o quizá nunca existió.
            Vuelve a la carta y sigue disfrutando sin prisa.
          </p>

          <div className="notfound-actions">
            <a href="/" className="notfound-btn notfound-btn--primary focus-ring" data-testid="link-notfound-home">
              Volver al inicio <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a href="/#carta" className="notfound-btn notfound-btn--ghost focus-ring" data-testid="link-notfound-menu">
              <MapPin size={15} aria-hidden="true" /> Ver la carta
            </a>
          </div>
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-main section-wrap">
          <span className="footer-tagline serif">Cafés de Carla — Huele, Saborea, Disfruta.</span>
          <LegalLinks />
        </div>
      </footer>
    </div>
  );
}
