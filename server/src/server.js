import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { requestId } from './middleware/request-id.middleware.js';
import { responseHelper } from './middleware/response.middleware.js';

import publicRoutes from './routes/public.routes.js';
import authRoutes from './routes/auth.routes.js';
import workspaceRoutes from './routes/workspace.routes.js';
import workspaceDetailRoutes from './routes/workspace-detail.routes.js';
import projectRoutes from './routes/project.routes.js';
import domainPublicRoutes from './routes/domain-public.routes.js';
import domainRoutes from './routes/domain.routes.js';
import siteRoutes from './routes/site.routes.js';
import publicSalesRoutes from './routes/public-sales.routes.js';
import commerceRoutes from './routes/commerce.routes.js';
import templateRoutes from './routes/template.routes.js';
import eventsRoutes from './routes/events.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import billingRoutes from './routes/billing.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import eventStreamRoutes from './routes/event-stream.routes.js';

dotenv.config();

const app = express();
const isProd = process.env.NODE_ENV === 'production';
// Render injects PORT automatically. Local dev defaults to 3001 (matches vite proxy).
const PORT = Number(process.env.PORT || (isProd ? 10000 : 3001));

// ── Static file serving ─────────────────────────────────────────────────────
const rootDir = resolve(process.cwd());
const distDir = join(rootDir, 'dist');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

function serveStatic(req, res) {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const decodedPath = decodeURIComponent(url.pathname);
  const safePath = decodedPath.replace(/^\/+/, '');
  let filePath = resolve(distDir, safePath);

  if (!filePath.startsWith(distDir) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(distDir, 'index.html');
  }

  const ext = extname(filePath);
  res.writeHead(200, {
    'Content-Type': mimeTypes[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
  });
  createReadStream(filePath).pipe(res);
}

// ── Global middleware ────────────────────────────────────────────────────────
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : true; // allow all in dev

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());
app.use(morgan(isProd ? 'combined' : 'dev'));
app.use(requestId);
app.use(responseHelper);

// ── Health check (must come before API and static routes) ───────────────────
app.get('/healthz', (req, res) => {
  res.type('text/plain').send('ok');
});

// ── API routes ───────────────────────────────────────────────────────────────

// Public (unauthenticated)
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/public/sites', publicSalesRoutes);
app.use('/api/v1/domains', domainPublicRoutes);
app.use('/api/v1/templates', templateRoutes);
app.use('/api/v1/events', eventsRoutes);

// Auth
app.use('/api/v1/auth', authRoutes);

// Workspace (authenticated)
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/workspaces/:workspaceId', workspaceDetailRoutes);
app.use('/api/v1/workspaces/:workspaceId/projects', projectRoutes);
app.use('/api/v1/workspaces/:workspaceId/domains', domainRoutes);
app.use('/api/v1/workspaces/:workspaceId/sites', siteRoutes);
app.use('/api/v1/workspaces/:workspaceId/commerce', commerceRoutes);
app.use('/api/v1/workspaces/:workspaceId/analytics', analyticsRoutes);
app.use('/api/v1/workspaces/:workspaceId/billing', billingRoutes);
app.use('/api/v1/workspaces/:workspaceId/settings', settingsRoutes);
app.use('/api/v1/workspaces/:workspaceId/events', eventStreamRoutes);

// ── SPA fallback — serve Vite dist for everything else ──────────────────────
app.use((req, res) => serveStatic(req, res));

// ── Error handler ────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  console.error(`[error] ${req.method} ${req.url} →`, err.message || err);
  res.status(status).json({
    error: { code: 'INTERNAL_ERROR', message: isProd ? 'An unexpected error occurred.' : (err.message || String(err)) },
    requestId: req.id,
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[glondia] API + static server listening on port ${PORT}`);
  console.log(`[glondia] Serving Vite app from ${distDir}`);
});
