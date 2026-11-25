import { useLanguage } from '@/context/LanguageContext';

export default function LangToggle({ className = '' }: { className?: string }) {
  const { lang, toggleLanguage } = useLanguage();
  const isEs = lang === 'es';

  return (
    <button
      type="button"
      className={`lang-toggle focus-ring ${className}`.trim()}
      aria-label={isEs ? 'Switch to English' : 'Cambiar a español'}
      title={isEs ? 'English' : 'Español'}
      onClick={toggleLanguage}
      data-testid="button-language-toggle"
    >
      <span className="lang-toggle__globe" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3.6 9h16.8M3.6 15h16.8" />
          <path d="M12 3c2.5 2.6 4 5.8 4 9s-1.5 6.4-4 9c-2.5-2.6-4-5.8-4-9s1.5-6.4 4-9Z" />
        </svg>
      </span>
      <span className="lang-toggle__label">{isEs ? 'ES' : 'EN'}</span>
    </button>
  );
}
