import { next, rewrite } from '@vercel/edge';

/**
 * Solo interceptamos la portada. Los rastreadores sociales (WhatsApp,
 * Facebook, Telegram, X, LinkedIn...) reciben una página HTML estática con
 * las metaetiquetas Open Graph. Los navegadores normales siguen viendo la SPA.
 *
 * El matcher es una optimización; la comprobación de ruta en el código evita
 * que, si no se aplicara, un rastreador que descarga /og-image.png reciba HTML.
 */
export const config = {
  matcher: '/',
};

const SOCIAL_CRAWLER =
  /WhatsApp|facebookexternalhit|facebookcatalog|Facebot|Twitterbot|LinkedInBot|TelegramBot|Slackbot|Discordbot|Pinterestbot|SkypeUriPreview|vkShare|redditbot|Mastodon|Bluesky|Embedly|Iframely/i;

export default function middleware(request: Request) {
  const { pathname } = new URL(request.url);

  if (pathname !== '/' && pathname !== '/index.html') {
    return next();
  }

  const userAgent = request.headers.get('user-agent') ?? '';

  if (SOCIAL_CRAWLER.test(userAgent)) {
    return rewrite(new URL('/og-preview.html', request.url));
  }

  return next();
}
