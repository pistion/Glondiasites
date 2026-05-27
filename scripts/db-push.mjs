/**
 * Normalizes DATABASE_URL for SQLite, creates the parent directory,
 * then runs `prisma db push` with the corrected env.
 * Used as the `db:push` npm script so Prisma CLI and the app runtime
 * always agree on the file path.
 */
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

function normalizeSqliteUrl(url) {
  if (!url.startsWith('file:')) return url;
  if (url.startsWith('file:///') || url.startsWith('file://')) return url;
  const path = url.slice('file:'.length);
  return path.startsWith('/') ? `file://${path}` : url;
}

function sqlitePathFromUrl(url) {
  if (!url.startsWith('file:')) return null;
  return url
    .replace(/^file:\/\/\//, '/')
    .replace(/^file:\/\//, '')
    .replace(/^file:\//, '/')
    .replace(/^file:/, '')
    .split('?')[0];
}

const raw = process.env.DATABASE_URL || 'file:/var/glondia/data/glondia.db';
const normalized = normalizeSqliteUrl(raw);
const sqlitePath = sqlitePathFromUrl(normalized);

if (sqlitePath) {
  mkdirSync(dirname(resolve(sqlitePath)), { recursive: true });
  console.log(`[db-push] dir ready: ${dirname(resolve(sqlitePath))}`);
}
console.log(`[db-push] DATABASE_URL=${normalized}`);

execFileSync(
  process.execPath,
  ['node_modules/.bin/prisma', 'db', 'push', '--schema=prisma/schema.prisma', '--accept-data-loss'],
  { stdio: 'inherit', env: { ...process.env, DATABASE_URL: normalized } },
);
