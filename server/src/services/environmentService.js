import crypto from 'node:crypto';
import renderApiService from './renderApiService.js';
import { mutateHostingStore, nowIso, redactEnvValue, readHostingStore } from './hostingStore.js';

class EnvironmentService {
  async list(serviceId) {
    return (await this.listRaw(serviceId)).map(publicEnvVar);
  }

  async listRaw(serviceId) {
    const store = await readHostingStore();
    return store.env[serviceId] || [];
  }

  async sync(serviceId) {
    const rows = await this.listRaw(serviceId);
    if (renderApiService.configured()) {
      const envVars = rows.map((item) => ({ key: item.key, value: readStoredValue(item) }));
      await renderApiService.upsertEnvVars(serviceId, envVars);
    }
    return mutateHostingStore((store) => {
      const nextRows = (store.env[serviceId] || []).map((item) => ({
        ...item,
        renderSynced: true,
        requiresRedeploy: true,
        updatedAt: nowIso(),
      }));
      store.env[serviceId] = nextRows;
      updateDeploymentEnv(store, serviceId, nextRows);
      return { synced: nextRows.length, requiresRedeploy: nextRows.some((item) => item.requiresRedeploy) };
    });
  }

  async upsert(serviceId, input = {}) {
    const envVar = validateEnvVar(input);
    let renderResult = null;
    if (renderApiService.configured()) {
      renderResult = await renderApiService.upsertEnvVars(serviceId, [envVar]);
    }
    return mutateHostingStore((store) => {
      const rows = store.env[serviceId] || [];
      const existing = rows.find((item) => item.key === envVar.key);
      const metadata = toMetadata(envVar, renderResult);
      if (existing) Object.assign(existing, metadata);
      else rows.unshift(metadata);
      store.env[serviceId] = rows;
      updateDeploymentEnv(store, serviceId, rows);
      return publicEnvVar(existing || metadata);
    });
  }

  async patch(serviceId, key, input = {}) {
    return this.upsert(serviceId, { ...input, key });
  }

  async remove(serviceId, key) {
    if (renderApiService.configured()) await renderApiService.deleteEnvVar(serviceId, key);
    return mutateHostingStore((store) => {
      store.env[serviceId] = (store.env[serviceId] || []).filter((item) => item.key !== key);
      updateDeploymentEnv(store, serviceId, store.env[serviceId]);
      return { deleted: true, key };
    });
  }
}

function validateEnvVar(input = {}) {
  const key = String(input.key || '').trim().toUpperCase();
  if (!/^[A-Z_][A-Z0-9_]{1,127}$/.test(key)) {
    const error = new Error('Environment variable keys must use uppercase letters, numbers, and underscores, and start with a letter or underscore.');
    error.status = 400;
    throw error;
  }
  const value = String(input.value ?? '');
  if (value.length > 8192) {
    const error = new Error('Environment variable values must be 8 KB or smaller.');
    error.status = 400;
    throw error;
  }
  return { key, value, environment: input.environment || 'production', secret: input.secret !== false };
}

function toMetadata(envVar, renderResult) {
  return {
    key: envVar.key,
    environment: envVar.environment,
    encrypted: envVar.secret,
    valuePreview: redactEnvValue(envVar.value),
    valueCiphertext: envVar.secret ? encryptValue(envVar.value) : undefined,
    valuePlaintext: envVar.secret ? undefined : envVar.value,
    renderSynced: Boolean(renderResult && renderResult.status !== 'configuration_required'),
    requiresRedeploy: true,
    updatedAt: nowIso(),
  };
}

function encryptValue(value) {
  const key = encryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString('base64')}:${tag.toString('base64')}:${ciphertext.toString('base64')}`;
}

function decryptValue(payload) {
  const [version, ivText, tagText, ciphertextText] = String(payload || '').split(':');
  if (version !== 'v1' || !ivText || !tagText || !ciphertextText) return '';
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivText, 'base64'));
  decipher.setAuthTag(Buffer.from(tagText, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(ciphertextText, 'base64')), decipher.final()]).toString('utf8');
}

function encryptionKey() {
  const secret = process.env.ENCRYPTION_KEY || process.env.SESSION_SECRET || 'local-render-hosting-secret';
  return crypto.createHash('sha256').update(secret).digest();
}

function readStoredValue(item = {}) {
  if (item.valuePlaintext !== undefined) return item.valuePlaintext;
  if (item.valueCiphertext) return decryptValue(item.valueCiphertext);
  return '';
}

function updateDeploymentEnv(store, serviceId, rows) {
  const deployment = store.deployments.find((item) => item.renderServiceId === serviceId || item.deploymentId === serviceId);
  if (!deployment) return;
  deployment.environmentVariablesMetadata = rows.map(publicEnvVar);
  deployment.updatedAt = nowIso();
}

function publicEnvVar(item = {}) {
  const { valueCiphertext, valuePlaintext, ...safe } = item;
  return safe;
}

export default new EnvironmentService();
