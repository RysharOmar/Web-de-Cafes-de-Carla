# Correcciones de textos pendientes — Cafés de Carla

> Nota para retomar el trabajo dentro de unos días. Este archivo no afecta al
> build ni al funcionamiento de la web.

## Cómo retomar

Abre una conversación nueva y envía exactamente esta frase:

> Retomamos Cafés de Carla. Lee `PENDIENTES-TEXTOS.md`, aplica las correcciones
> anotadas y haz build, commit y push. No cambies nada más.

Si tienes capturas de pantalla o el texto exacto, pégalo justo debajo de esa
frase. Con la tabla rellena no hace falta que recuerdes nada más.

## Estado del proyecto

- Repo: `https://github.com/RysharOmar/Web-de-Cafes-de-Carla.git`
- Producción: `https://cafes-de-carla.vercel.app`
- Último commit de referencia: `e1fc9fb` (vista previa de WhatsApp funcionando)
- Web: SPA de Vite en `artifacts/cafes-de-carla`
- Build: `npx --yes pnpm@10.28.0 run build`
- Tras el build, comprobar que no se cuelan cambios en archivos `.tsbuildinfo`
  ni en `artifacts/mockup-sandbox/src/.generated/mockup-components.ts`.

## Correcciones anotadas

Rellena una fila por cada texto. En «Dónde» indica la página y la sección
(por ejemplo: «Portada → historia», «Menú → categoría Café», «Aviso legal»).

| # | Dónde (página / sección) | Texto actual | Texto corregido | Notas |
|---|--------------------------|--------------|-----------------|-------|
| 1 |                          |              |                 |       |
| 2 |                          |              |                 |       |
| 3 |                          |              |                 |       |
| 4 |                          |              |                 |       |
| 5 |                          |              |                 |       |

## Dónde están los textos

| Zona | Archivo |
|------|---------|
| Portada, cabecera, historia, secciones y pie | `artifacts/cafes-de-carla/src/App.tsx` |
| Datos del menú y productos | `artifacts/cafes-de-carla/src/data/menu.ts` y `src/lib/products.ts` |
| Páginas legales (aviso, privacidad, cookies) | `artifacts/cafes-de-carla/src/pages/legal.tsx` |
| Página 404 | `artifacts/cafes-de-carla/src/pages/not-found.tsx` |
| Login y acceso denegado | `artifacts/cafes-de-carla/src/pages/Login.tsx` y `src/pages/access-denied.tsx` |
| Pedido completado | `artifacts/cafes-de-carla/src/pages/success.tsx` |
| Cocina y administración | `artifacts/cafes-de-carla/src/pages/cocina.tsx` y `src/pages/AdminPanel.tsx` |
| Aviso de cookies | `artifacts/cafes-de-carla/src/components/cookie-banner.tsx` |
| Título y metadatos SEO/Open Graph | `artifacts/cafes-de-carla/index.html` |
| HTML de vista previa para WhatsApp | `artifacts/cafes-de-carla/public/og-preview.html` |
| Imagen de vista previa | `artifacts/cafes-de-carla/public/og-image.png` |

## Avisos importantes

- Si cambia el eslogan «Huele, Saborea, Disfruta», el nombre «Cafés de Carla»
  o la URL, hay que **regenerar `og-image.png`** (1200×630) y actualizar
  `index.html` y `og-preview.html`.
- Para comprobar la vista previa social después de desplegar, usar un enlace
  nuevo (`?v=2`, `?v=3`...) y esperar a que aparezca la tarjeta antes de
  enviarlo. WhatsApp cachea cada URL.
- No es necesario tocar `middleware.ts` ni los favicons para cambios de texto.
- Tras los cambios: build, commit, push y verificar producción.
