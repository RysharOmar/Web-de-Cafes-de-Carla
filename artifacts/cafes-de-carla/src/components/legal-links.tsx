import { useLanguage } from '@/context/LanguageContext';

export default function LegalLinks({ className = '' }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <nav className={`footer-legal ${className}`} aria-label="Información legal">
      <a href="/aviso-legal" data-testid="link-aviso-legal">{t('Aviso legal')}</a>
      <a href="/politica-privacidad" data-testid="link-politica-privacidad">{t('Privacidad')}</a>
      <a href="/politica-cookies" data-testid="link-politica-cookies">{t('Cookies')}</a>
    </nav>
  );
}
