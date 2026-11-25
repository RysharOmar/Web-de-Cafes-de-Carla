import { useState, type FormEvent } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import LegalLinks from '@/components/legal-links';
import ThemeToggle from '@/components/theme-toggle';
import LangToggle from '@/components/lang-toggle';
import { useLanguage } from '@/context/LanguageContext';

export default function Login() {
  const [, navigate] = useLocation();
  const { signInWithPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { t } = useLanguage();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    const { user, error: signInError } = await signInWithPassword(email.trim(), password);
    setSubmitting(false);

    if (signInError) {
      setError(signInError.message || 'No se pudo iniciar sesión. Revisa tus credenciales.');
      return;
    }

    const role = user?.app_metadata?.role;
    if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'cocina') {
      navigate('/cocina');
    } else {
      navigate('/');
    }
  }

  return (
    <div className="site-shell grain login-shell">
      <header className="site-header">
        <div className="header-inner section-wrap">
          <a href="/" className="text-cta focus-ring">
            <ArrowLeft size={15} aria-hidden="true" /> {t('Volver a la carta')}
          </a>
          <div style={{ flex: 1 }} />
          <span className="serif" style={{ fontSize: '20px', color: '#4a3322' }}>Cafés de Carla</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ThemeToggle />
            <LangToggle />
            <span className="eyebrow" style={{ color: '#83915f' }}>{t('Acceso de personal')}</span>
          </div>
        </div>
      </header>

      <main className="login-main section-wrap">
        <div className="login-card">
          <span className="eyebrow">PANEL INTERNO</span>
          <h1 className="serif login-title">Iniciar sesión</h1>
          <p className="login-subtitle">Accede con tu cuenta de personal para entrar al panel correspondiente.</p>

          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="login-email">
              <Mail size={15} aria-hidden="true" /> Correo electrónico
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@correo.com"
              data-testid="input-login-email"
            />

            <label htmlFor="login-password">
              <LockKeyhole size={15} aria-hidden="true" /> Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tu contraseña"
              data-testid="input-login-password"
            />

            {error && <p className="login-error" role="alert">{error}</p>}

            <button
              type="submit"
              className="login-submit focus-ring"
              disabled={submitting}
              data-testid="button-login-submit"
            >
              {submitting ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-main section-wrap">
          <span className="footer-tagline serif">Cafés de Carla — Acceso de personal</span>
          <LegalLinks />
        </div>
      </footer>
    </div>
  );
}
