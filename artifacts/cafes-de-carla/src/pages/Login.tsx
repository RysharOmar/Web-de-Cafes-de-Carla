import { useState, type FormEvent } from 'react';
import { useLocation } from 'wouter';
import { LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
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
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-10" style={{ background: '#f5f0e5' }}>
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-8">
          <span className="serif" style={{ fontSize: '34px', color: '#4a3322', fontWeight: 400 }}>Cafés de Carla</span>
        </div>

        <div className="login-card">
          <span className="eyebrow">{t('PANEL INTERNO')}</span>
          <h1 className="serif login-title">{t('Iniciar sesión')}</h1>
          <p className="login-subtitle">{t('Accede con tu cuenta de personal para entrar al panel correspondiente.')}</p>

          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="login-email">
              <Mail size={15} aria-hidden="true" /> {t('Correo electrónico')}
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
              <LockKeyhole size={15} aria-hidden="true" /> {t('Contraseña')}
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t('Tu contraseña')}
              data-testid="input-login-password"
            />

            {error && <p className="login-error" role="alert">{error}</p>}

            <button
              type="submit"
              className="login-submit focus-ring"
              disabled={submitting}
              data-testid="button-login-submit"
            >
              {submitting ? t('Entrando…') : t('Entrar')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
