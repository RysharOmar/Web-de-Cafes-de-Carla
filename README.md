# glowing-circuit

Monorepo con pnpm workspaces. API en Express 5, clientes de API generados con Orval, DB con Drizzle + PostgreSQL, y apps web con Vite + React.

## Despliegue en Vercel

Conectar este repositorio en Vercel > Import > GitHub. El archivo `vercel.json` ya configura:

- `installCommand`: `pnpm install --frozen-lockfile`
- `buildCommand`: `pnpm -r build`

No es necesario añadir variables de entorno para que el build funcione.

## Env vars de RUNTIME

Configurarlas en Vercel > Settings > Environment Variables:

- `DATABASE_URL` — cadena de conexión de Postgres (requerida por `@workspace/db` y el API server al arrancar)
- `PORT` — puerto donde escucha el servidor (opcional, Vercel lo provee)
- `STRIPE_SECRET_KEY` — clave secreta de Stripe (modo prueba: `sk_test_...`). Requerida por el backend para crear sesiones de checkout.
- `STRIPE_WEBHOOK_SECRET` — secreto de firma de webhook de Stripe (`whsec_...`). Requerido para validar eventos de `/api/webhook`.
- `N8N_WEBHOOK_URL` — URL del webhook de n8n a la que se notifican los pagos completados (solo runtime).
- `APP_URL` — URL base de la aplicación (usada para `success_url` y `cancel_url` de Stripe Checkout).

Validaciones de estas variables ocurren solo en runtime (arranque del servidor), nunca durante el build.

## Env vars de BUILD

Idealmente ninguna. Los configs de Vite y los scripts de build usan valores por defecto (`PORT` → 3000, `BASE_PATH` → `/`) y nunca leen variables obligatorias en tiempo de build.

## Scripts

- `pnpm install` — instalar dependencias (requiere pnpm)
- `pnpm run build` — typecheck + build de todos los paquetes
- `pnpm run typecheck` — typecheck completo del monorepo
- `pnpm --filter @workspace/api-server run dev` — ejecutar API localmente
