import { ShieldAlert } from 'lucide-react';
import LegalLinks from '@/components/legal-links';

export default function AccessDenied() {
  return (
    <div className="site-shell grain legal-shell">
      <main className="section-wrap legal-main">
        <div className="legal-heading">
          <span className="legal-icon" aria-hidden="true"><ShieldAlert size={24} /></span>
          <div>
            <span className="eyebrow">ACCESO RESTRINGIDO</span>
            <h1 className="serif legal-title">No tienes acceso a esta sección</h1>
            <p className="legal-intro">Tu cuenta no tiene el rol necesario para ver esta página.</p>
          </div>
        </div>
        <div className="login-card-actions">
          <a href="/" className="cookie-banner-btn cookie-banner-btn--primary">Volver a la carta</a>
          <a href="/login" className="cookie-banner-btn cookie-banner-btn--ghost">Cambiar de cuenta</a>
        </div>
      </main>
      <footer className="site-footer">
        <div className="footer-main section-wrap">
          <span className="footer-tagline serif">Cafés de Carla — Acceso denegado</span>
          <LegalLinks />
        </div>
      </footer>
    </div>
  );
}
