import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const rootDir = resolve(process.cwd());
const fallbackDataDir = join(rootDir, '.glondia-data');
const dataDir = resolve(process.env.DATA_DIR || fallbackDataDir);
const storePath = join(dataDir, 'render-hosting.json');

export async function readHostingStore() {
  await ensureStore();
  const text = await readFile(storePath, 'utf8');
  return JSON.parse(text);
}

export async function writeHostingStore(store) {
  await mkdir(dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(store, null, 2));
  return store;
}

export async function mutateHostingStore(mutator) {
  const store = await readHostingStore();
  const result = await mutator(store);
  await writeHostingStore(store);
  return result;
}

function emptyStore() {
  return {
    deployments: [],
    sessions: [],
    logs: {},
    env: {},
    disks: {},
    domains: {},
  };
}

async function ensureStore() {
  if (existsSync(storePath)) return;
  await mkdir(dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(emptyStore(), null, 2));
}

export function makeId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function redactEnvValue(value) {
  const raw = String(value ?? '');
  if (!raw) return '';
  return raw.length <= 4 ? '****' : `${raw.slice(0, 2)}${'*'.repeat(Math.min(8, raw.length - 2))}`;
}

