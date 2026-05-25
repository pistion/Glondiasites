import crypto from 'node:crypto';
import renderApiService from './renderApiService.js';
import { mutateHostingStore, nowIso, redactEnvValue, readHostingStore } from './hostingStore.js';

class EnvironmentService {
  async list(serviceId) {
    const store = await readHostingStore();
    return store.env[serviceId] || [];
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
      return existing || metadata;
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
    valueCiphertext: envVar.secret ? encryptValue(envVar.value) : envVar.value,
    renderSynced: Boolean(renderResult && renderResult.status !== 'configuration_required'),
    requiresRedeploy: true,
    updatedAt: nowIso(),
  };
}

function encryptValue(value) {
  const secret = process.env.ENCRYPTION_KEY || process.env.SESSION_SECRET || 'local-render-hosting-secret';
  return crypto.createHmac('sha256', secret).update(String(value)).digest('hex');
}

function updateDeploymentEnv(store, serviceId, rows) {
  const deployment = store.deployments.find((item) => item.renderServiceId === serviceId || item.deploymentId === serviceId);
  if (!deployment) return;
  deployment.environmentVariablesMetadata = rows.map(({ valueCiphertext, ...metadata }) => metadata);
  deployment.updatedAt = nowIso();
}

export default new EnvironmentService();

