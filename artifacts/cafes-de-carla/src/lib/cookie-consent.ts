export type CookieConsent = 'accepted' | 'rejected';

export const COOKIE_CONSENT_KEY = 'cafes_de_carla_cookie_consent';
export const COOKIE_CONSENT_EVENT = 'cafes-de-carla:cookie-consent';

export function getCookieConsent(): CookieConsent | null {
  try {
    const value = localStorage.getItem(COOKIE_CONSENT_KEY);
    return value === 'accepted' || value === 'rejected' ? value : null;
  } catch {
    return null;
  }
}

export function setCookieConsent(value: CookieConsent) {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
  } catch {
    // Si localStorage no está disponible, no persistimos la preferencia.
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<CookieConsent>(COOKIE_CONSENT_EVENT, { detail: value }));
  }
}

export function resetCookieConsent() {
  try {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
  } catch {
    // Sin efecto si localStorage está bloqueado.
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT));
  }
}

/** Devuelve true solo cuando el usuario aceptó explícitamente las cookies no necesarias. */
export function canLoadThirdPartyScripts(): boolean {
  return getCookieConsent() === 'accepted';
}

/**
 * Punto único de carga de scripts de terceros (Analytics, maps externos, etc.).
 * Hoy no hay ninguno configurado, pero cualquier script que se añada aquí
 * quedará bloqueado automáticamente si el usuario eligió "Rechazar no necesarias".
 */
export function loadThirdPartyScripts() {
  if (!canLoadThirdPartyScripts()) return;

  const thirdPartyScripts: { id: string; src: string }[] = [];

  thirdPartyScripts.forEach(({ id, src }) => {
    if (document.getElementById(id)) return;
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    document.head.appendChild(script);
  });
}
