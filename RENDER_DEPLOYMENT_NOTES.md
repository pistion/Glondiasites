# Render deployment settings

Use **Static Site**, not Web Service.

Recommended dashboard settings:

- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`
- Node Version: `22.22.0`
- Root Directory: leave blank, unless the app is inside a subfolder

For React Router routes, add this Render rewrite rule if you configure the service manually:

- Source: `/*`
- Destination: `/index.html`
- Action: `Rewrite`

The repo includes `.node-version`, `.nvmrc`, and `render.yaml` to make Render use Node 22 and publish the Vite `dist` folder.
