import { useLanguage } from '@/context/LanguageContext';

export default function LangToggle({ className = '' }: { className?: string }) {
  const { lang, toggleLanguage } = useLanguage();
  return (
    <button
      type="button"
      className={`lang-toggle focus-ring ${className}`.trim()}
      aria-label={lang === 'es' ? 'Cambiar a inglés' : 'Cambiar a español'}
      title={lang === 'es' ? 'English' : 'Español'}
      onClick={toggleLanguage}
      data-testid="button-language-toggle"
    >
      {lang === 'es' ? 'ES / EN' : 'EN / ES'}
    </button>
  );
}
