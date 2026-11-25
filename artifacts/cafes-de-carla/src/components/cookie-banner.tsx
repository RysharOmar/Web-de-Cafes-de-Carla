import { useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';
import {
  COOKIE_CONSENT_EVENT,
  getCookieConsent,
  loadThirdPartyScripts,
  setCookieConsent,
  type CookieConsent,
} from '@/lib/cookie-consent';
import { useLanguage } from '@/context/LanguageContext';

export default function CookieBanner() {
  const [choice, setChoice] = useState<CookieConsent | null>(() => getCookieConsent());
  const { t } = useLanguage();

  useEffect(() => {
    const handleChange = () => setChoice(getCookieConsent());
    window.addEventListener(COOKIE_CONSENT_EVENT, handleChange);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, handleChange);
  }, []);

  useEffect(() => {
    // Solo se cargan scripts de terceros cuando hay consentimiento aceptado.
    loadThirdPartyScripts();
  }, [choice]);

  if (choice) return null;

  const choose = (value: CookieConsent) => {
    setCookieConsent(value);
    setChoice(value);
  };

  return (
    <aside className="cookie-banner" role="dialog" aria-label="Preferencias de cookies" data-testid="cookie-banner">
      <div className="cookie-banner-inner section-wrap">
        <div className="cookie-banner-copy">
          <span className="cookie-banner-icon" aria-hidden="true"><Cookie size={22} /></span>
          <div>
            <strong>{t('Usamos cookies para cuidar tu experiencia')}</strong>
            <p>{t('Las cookies necesarias guardan tu carrito y tus preferencias. Con tu permiso, podríamos usar cookies de análisis para mejorar la web. Tú decides.')}</p>
          </div>
        </div>
        <div className="cookie-banner-actions">
          <button
            type="button"
            className="cookie-banner-btn cookie-banner-btn--ghost"
            onClick={() => choose('rejected')}
            data-testid="button-cookie-reject"
          >
            {t('Rechazar no necesarias')}
          </button>
          <button
            type="button"
            className="cookie-banner-btn cookie-banner-btn--primary"
            onClick={() => choose('accepted')}
            data-testid="button-cookie-accept"
          >
            {t('Aceptar todas')}
          </button>
        </div>
      </div>
    </aside>
  );
}
