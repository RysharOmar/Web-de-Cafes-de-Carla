import { ArrowRight, Coffee } from 'lucide-react';
import LegalLinks from '@/components/legal-links';
import ThemeToggle from '@/components/theme-toggle';
import LangToggle from '@/components/lang-toggle';
import { useLanguage } from '@/context/LanguageContext';

export default function NotFound() {
  const { t, lang } = useLanguage();
  return (
    <div className="site-shell grain notfound-shell">
      <header className="site-header">
        <div className="header-inner section-wrap">
          <span className="serif" style={{ fontSize: '20px', color: '#4a3322' }}>Cafés de Carla</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ThemeToggle />
            <LangToggle />
          </div>
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

          <span className="eyebrow">{t('ESTA RUTA NO EXISTE')}</span>
          <h1 className="serif notfound-title">
            {lang === 'en' ? (
              <>We have spilled<br /><em>the path.</em></>
            ) : (
              <>Se nos ha derramado<br /><em>el camino.</em></>
            )}
          </h1>
          <p className="notfound-copy">
            {t('La página que buscas no está aquí, se ha movido o quizá nunca existió. Vuelve a la carta y sigue disfrutando sin prisa.')}
          </p>

          <div className="notfound-actions">
            <a href="/" className="notfound-btn notfound-btn--primary focus-ring" data-testid="link-notfound-home">
              {t('Volver al inicio')} <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-main section-wrap">
          <span className="footer-tagline serif">Cafés de Carla — {t('Huele, Saborea, Disfruta.')}</span>
          <LegalLinks />
        </div>
      </footer>
    </div>
  );
}
