import { PrismaClient } from '@prisma/client';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

function ensureSqliteUrl(url) {
  if (!url || !url.startsWith('file:')) return url;
  if (url.startsWith('file:///') || url.startsWith('file://')) return url;
  const path = url.slice('file:'.length);
  if (path.startsWith('/')) return `file://${path}`;
  return url;
}

function ensureDbDir(url) {
  if (!url || !url.startsWith('file:')) return;
  try {
    const path = url
      .replace(/^file:\/\/\//, '/')
      .replace(/^file:\/\//, '')
      .replace(/^file:\//, '/')
      .replace(/^file:/, '')
      .split('?')[0];
    const dir = dirname(path);
    if (dir && dir !== '.' && dir !== '/') mkdirSync(dir, { recursive: true });
  } catch { /* Prisma will surface the real error */ }
}

const rawUrl = process.env.DATABASE_URL;
const normalizedUrl = ensureSqliteUrl(rawUrl);
if (normalizedUrl && normalizedUrl !== rawUrl) {
  process.env.DATABASE_URL = normalizedUrl;
  console.log('[db] DATABASE_URL normalized for runtime safety.');
}
ensureDbDir(process.env.DATABASE_URL);

const globalForPrisma = globalThis;
const slowQueryMs = Number(process.env.PRISMA_SLOW_QUERY_MS || 200);
const logQueries = String(process.env.PRISMA_LOG_QUERIES || 'false').toLowerCase() === 'true';

// NOTE: prisma.$use() was removed in Prisma 5. Soft-delete filtering is done
// explicitly in each route query (where: { deletedAt: null }).
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'stdout', level: 'warn' },
      { emit: 'stdout', level: 'error' },
    ],
  });

prisma.$on('query', (event) => {
  if (logQueries) console.debug(`[db:query] ${event.duration}ms ${event.query}`);
  if (event.duration >= slowQueryMs) console.warn(`[db:slow-query] ${event.duration}ms ${event.query}`);
});

export async function connectPrisma() {
  await prisma.$connect();
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
}

export async function withTransaction(callback, options = {}) {
  return prisma.$transaction(
    async (tx) => callback(tx),
    {
      maxWait: Number(options.maxWait ?? process.env.PRISMA_TX_MAX_WAIT_MS ?? 5000),
      timeout: Number(options.timeout ?? process.env.PRISMA_TX_TIMEOUT_MS ?? 15000),
      isolationLevel: options.isolationLevel,
    },
  );
}

export async function withCompensatingTransaction({ transaction, compensate }) {
  const compensations = [];
  const addCompensation = (fn) => { if (typeof fn === 'function') compensations.push(fn); };
  try {
    return await withTransaction((tx) => transaction(tx, addCompensation));
  } catch (error) {
    for (const step of compensations.reverse()) {
      try { await step(error); } catch (e) { console.error('[db:compensation-failed]', e); }
    }
    if (typeof compensate === 'function') {
      try { await compensate(error); } catch (e) { console.error('[db:final-compensation-failed]', e); }
    }
    throw error;
  }
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
