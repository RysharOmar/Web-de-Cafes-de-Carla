import type { ReactNode } from 'react';
import { ArrowLeft, Cookie, FileText, ShieldCheck } from 'lucide-react';
import LegalLinks from '@/components/legal-links';
import ThemeToggle from '@/components/theme-toggle';
import LangToggle from '@/components/lang-toggle';
import { useLanguage } from '@/context/LanguageContext';
import { resetCookieConsent } from '@/lib/cookie-consent';

export type LegalPageKind = 'aviso-legal' | 'politica-privacidad' | 'politica-cookies';

type Section = { title: string; body: ReactNode };

const OWNER = 'Cafés de Carla (titular de la web; datos registrales pendientes de confirmar)';
const CONTACT = 'hola@cafesdecarla.es (correo de contacto provisional)';

const content: Record<LegalPageKind, { eyebrow: string; title: string; intro: string; icon: ReactNode; sections: Section[] }> = {
  'aviso-legal': {
    eyebrow: 'INFORMACIÓN LEGAL',
    title: 'Aviso legal',
    intro: 'Información general sobre el titular y las condiciones de uso de esta web.',
    icon: <FileText size={24} aria-hidden="true" />,
    sections: [
      {
        title: 'Titular de la web',
        body: <p>El titular de este sitio es {OWNER}. Puedes contactar con nosotros en {CONTACT}.</p>,
      },
      {
        title: 'Finalidad del sitio',
        body: <p>Esta web permite consultar la carta, realizar pedidos a domicilio y gestionar pedidos en el local (modo mesa).</p>,
      },
      {
        title: 'Condiciones de uso',
        body: <p>El uso de la web implica aceptar este aviso legal. Los precios y la disponibilidad de los productos pueden variar y se confirman al finalizar el pedido.</p>,
      },
      {
        title: 'Responsabilidad',
        body: <p>El titular no se hace responsable de usos ajenos a la finalidad de la web ni de daños derivados de causas fuera de su control.</p>,
      },
    ],
  },
  'politica-privacidad': {
    eyebrow: 'PROTECCIÓN DE DATOS',
    title: 'Política de privacidad',
    intro: 'Cómo tratamos tus datos personales cuando haces un pedido en Cafés de Carla.',
    icon: <ShieldCheck size={24} aria-hidden="true" />,
    sections: [
      {
        title: 'Responsable del tratamiento',
        body: <p>El responsable de tus datos es {OWNER}. Contacto: {CONTACT}.</p>,
      },
      {
        title: 'Finalidad de los datos',
        body: <p>Usamos tus datos exclusivamente para gestionar tus pedidos, prepararlos, entregarlos y atender incidencias relacionadas con la compra.</p>,
      },
      {
        title: 'Proveedores de servicios',
        body: (
          <ul>
            <li><strong>Neon</strong>: base de datos donde se guardan pedidos y productos.</li>
            <li><strong>Vercel</strong>: alojamiento y ejecución de la web.</li>
            <li><strong>Stripe</strong>: procesamiento seguro de pagos; los datos de tarjeta no se almacenan en nuestros servidores.</li>
          </ul>
        ),
      },
      {
        title: 'Tus derechos',
        body: <p>Puedes ejercer tus derechos de acceso, rectificación y supresión de tus datos, además de otros derechos reconocidos por el RGPD, escribiendo a {CONTACT}.</p>,
      },
      {
        title: 'Conservación',
        body: <p>Conservamos los datos de pedidos durante el tiempo necesario para atenderlos y cumplir con las obligaciones legales aplicables.</p>,
      },
    ],
  },
  'politica-cookies': {
    eyebrow: 'COOKIES',
    title: 'Política de cookies',
    intro: 'Qué guardamos en tu navegador y cómo puedes cambiar tu decisión.',
    icon: <Cookie size={24} aria-hidden="true" />,
    sections: [
      {
        title: 'Cookies y almacenamiento necesario',
        body: <p>Usamos almacenamiento local del navegador (localStorage) para recordar tu carrito, tus preferencias de sonido del panel de cocina y tu elección sobre cookies. Estos datos son necesarios para que la web funcione.</p>,
      },
      {
        title: 'Cookies no necesarias',
        body: <p>Cuando aceptas todas las cookies, habilitamos la carga de scripts de terceros. Si rechazas las cookies no necesarias, esos scripts no se cargan. Actualmente no utilizamos herramientas de analítica activas.</p>,
      },
      {
        title: 'Cambiar tu elección',
        body: (
          <div>
            <p>Puedes volver a elegir en cualquier momento:</p>
            <button
              type="button"
              className="legal-reset-button focus-ring"
              onClick={() => resetCookieConsent()}
            >
              Cambiar preferencias de cookies
            </button>
          </div>
        ),
      },
      {
        title: 'Más información',
        body: <p>Para cualquier duda sobre esta política puedes escribir a {CONTACT}.</p>,
      },
    ],
  },
};

export default function LegalPage({ kind }: { kind: LegalPageKind }) {
  const page = content[kind];
  const { t } = useLanguage();

  return (
    <div className="site-shell grain legal-shell">
      <header className="site-header">
        <div className="header-inner section-wrap">
          <a href="/" className="text-cta focus-ring" data-testid="button-back-home">
            <ArrowLeft size={15} aria-hidden="true" /> {t('Volver a la carta')}
          </a>
          <div style={{ flex: 1 }} />
          <span className="serif" style={{ fontSize: '20px', color: '#4a3322' }}>Cafés de Carla</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ThemeToggle />
            <LangToggle />
            <span className="eyebrow" style={{ color: '#83915f' }}>{t('Información')}</span>
          </div>
        </div>
      </header>

      <main className="section-wrap legal-main">
        <div className="legal-heading">
          <span className="legal-icon" aria-hidden="true">{page.icon}</span>
          <div>
            <span className="eyebrow">{page.eyebrow}</span>
            <h1 className="serif legal-title">{page.title}</h1>
            <p className="legal-intro">{page.intro}</p>
          </div>
        </div>

        <div className="legal-card">
          {page.sections.map((section) => (
            <section key={section.title} className="legal-section">
              <h2 className="serif">{section.title}</h2>
              {section.body}
            </section>
          ))}
        </div>

        <p className="legal-note">
          Texto informativo de ejemplo; sustitúyelo por el definitivo con los datos registrales y de contacto reales antes del lanzamiento.
        </p>
      </main>

      <footer className="site-footer">
        <div className="footer-main section-wrap">
          <span className="footer-tagline serif">Cafés de Carla — Información legal</span>
          <LegalLinks />
        </div>
      </footer>
    </div>
  );
}
