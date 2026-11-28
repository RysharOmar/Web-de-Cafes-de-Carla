import { useLanguage } from '@/context/LanguageContext';

export default function LegalLinks({ className = '' }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <nav className={`footer-legal flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 ${className}`} aria-label="Información legal">
      <a href="/aviso-legal" data-testid="link-aviso-legal">{t('Aviso legal')}</a>
      <span aria-hidden="true" className="text-[#9a8a76]">•</span>
      <a href="/politica-privacidad" data-testid="link-politica-privacidad">{t('Privacidad')}</a>
      <span aria-hidden="true" className="text-[#9a8a76]">•</span>
      <a href="/politica-cookies" data-testid="link-politica-cookies">{t('Cookies')}</a>
    </nav>
  );
}
