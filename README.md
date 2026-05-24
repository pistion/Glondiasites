# Glondia Sites

A Vite React application for hosting, domain management, site building, and deployment workflows.

## Local development

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173`.  
All data is stored in browser localStorage — no backend, database, or environment variables required.

## Production build

```bash
npm run build   # outputs to dist/
npm start       # serves dist/ on port 10000
```

Health check: `http://127.0.0.1:10000/healthz`

## Render deployment

| Setting | Value |
|---|---|
| Runtime | Node |
| Root Directory | *(blank)* |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/healthz` |
| Node Version | `24.14.1` |

Only one environment variable is needed:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |

No Postgres, Redis, Prisma, JWT secrets, or backend service required.

## Integrations

All integration functions (GitHub, Render, Spaceship/registrar, builder, domains, DNS) are exported
from `src/api.js` and operate on local browser storage by default. The app compiles and runs fully
without any environment secrets.

To add live integrations later, wire a secure server-side proxy and set `VITE_ENABLE_REMOTE_API=true`
with `VITE_API_BASE_URL=https://your-backend-url/api/v1`. Never expose Render API keys, Spaceship
secrets, or GitHub tokens in the Vite client bundle.
