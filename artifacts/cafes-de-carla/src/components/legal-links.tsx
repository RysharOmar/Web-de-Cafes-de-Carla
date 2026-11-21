export default function LegalLinks({ className = '' }: { className?: string }) {
  return (
    <nav className={`footer-legal ${className}`} aria-label="Información legal">
      <a href="/aviso-legal" data-testid="link-aviso-legal">Aviso legal</a>
      <a href="/politica-privacidad" data-testid="link-politica-privacidad">Privacidad</a>
      <a href="/politica-cookies" data-testid="link-politica-cookies">Cookies</a>
    </nav>
  );
}
