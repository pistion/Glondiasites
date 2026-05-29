const RENDER_BASE_URL = process.env.RENDER_API_BASE_URL || 'https://api.render.com/v1';

class RenderApiService {
  configured() {
    if (String(process.env.RENDER_API_DISABLED || '').toLowerCase() === 'true') return false;
    return Boolean(process.env.RENDER_API_KEY && process.env.RENDER_OWNER_ID);
  }

  settings() {
    return {
      provider: 'render',
      configured: this.configured(),
      ownerIdPresent: Boolean(process.env.RENDER_OWNER_ID),
      required: ['RENDER_API_KEY', 'RENDER_OWNER_ID'].filter((key) => !process.env[key]),
    };
  }

  async createService(input = {}) {
    this.assertConfigured('create_service');
    const body = this.buildServicePayload(input);
    return this.request('/services', { method: 'POST', body });
  }

  async getService(serviceId) {
    this.assertConfigured('get_service');
    return this.request(`/services/${encodeURIComponent(serviceId)}`);
  }

  async updateService(serviceId, settings = {}) {
    this.assertConfigured('update_service');
    return this.request(`/services/${encodeURIComponent(serviceId)}`, { method: 'PATCH', body: settings });
  }

  async suspendService(serviceId) {
    this.assertConfigured('suspend_service');
    return this.request(`/services/${encodeURIComponent(serviceId)}/suspend`, { method: 'POST', body: {} });
  }

  async deleteService(serviceId) {
    this.assertConfigured('delete_service');
    return this.request(`/services/${encodeURIComponent(serviceId)}`, { method: 'DELETE' });
  }

  async triggerDeploy(serviceId, input = {}) {
    this.assertConfigured('trigger_deploy');
    return this.request(`/services/${encodeURIComponent(serviceId)}/deploys`, {
      method: 'POST',
      body: {
        clearCache: input.clearCache || 'do_not_clear',
        deployMode: input.deployMode || 'build_and_deploy',
        ...(input.commitId ? { commitId: input.commitId } : {}),
      },
    });
  }

  async getDeploy(serviceId, deployId) {
    this.assertConfigured('get_deploy');
    return this.request(`/services/${encodeURIComponent(serviceId)}/deploys/${encodeURIComponent(deployId)}`);
  }

  async listDeploys(serviceId, limit = 20) {
    this.assertConfigured('list_deploys');
    return this.request(`/services/${encodeURIComponent(serviceId)}/deploys?limit=${encodeURIComponent(limit)}`);
  }

  // Fetch deploy log lines. Returns { logs: [{ id, message, timestamp, type }] }
  // cursor is the id of the last log line seen; pass it to get only new lines.
  async getDeployLogs(serviceId, deployId, cursor = null) {
    this.assertConfigured('get_deploy_logs');
    const params = new URLSearchParams({ limit: '200' });
    if (cursor) params.set('cursor', cursor);
    return this.request(
      `/services/${encodeURIComponent(serviceId)}/deploys/${encodeURIComponent(deployId)}/logs?${params}`
    );
  }

  async listEnvVars(serviceId) {
    this.assertConfigured('list_env_vars');
    return this.request(`/services/${encodeURIComponent(serviceId)}/env-vars?limit=100`);
  }

  async upsertEnvVars(serviceId, envVars = []) {
    this.assertConfigured('upsert_env_vars');
    const results = [];
    for (const envVar of envVars) {
      results.push(await this.request(`/services/${encodeURIComponent(serviceId)}/env-vars/${encodeURIComponent(envVar.key)}`, {
        method: 'PUT',
        body: { value: envVar.value },
      }));
    }
    return { envVars: results };
  }

  async deleteEnvVar(serviceId, key) {
    this.assertConfigured('delete_env_var');
    return this.request(`/services/${encodeURIComponent(serviceId)}/env-vars/${encodeURIComponent(key)}`, { method: 'DELETE' });
  }

  async createDisk(serviceId, disk = {}) {
    this.assertConfigured('create_disk');
    return this.request(`/services/${encodeURIComponent(serviceId)}/disks`, {
      method: 'POST',
      body: {
        name: disk.name,
        mountPath: disk.mountPath,
        sizeGB: Number(disk.sizeGB || disk.size || 1),
      },
    });
  }

  async updateDisk(serviceId, diskId, disk = {}) {
    this.assertConfigured('update_disk');
    return this.request(`/services/${encodeURIComponent(serviceId)}/disks/${encodeURIComponent(diskId)}`, {
      method: 'PATCH',
      body: disk,
    });
  }

  async deleteDisk(serviceId, diskId) {
    this.assertConfigured('delete_disk');
    return this.request(`/services/${encodeURIComponent(serviceId)}/disks/${encodeURIComponent(diskId)}`, { method: 'DELETE' });
  }

  async addCustomDomain(serviceId, domainName) {
    this.assertConfigured('add_custom_domain');
    return this.request(`/services/${encodeURIComponent(serviceId)}/custom-domains`, {
      method: 'POST',
      body: { name: domainName },
    });
  }

  async listCustomDomains(serviceId) {
    this.assertConfigured('list_custom_domains');
    return this.request(`/services/${encodeURIComponent(serviceId)}/custom-domains?limit=100`);
  }

  async getCustomDomain(serviceId, domainId) {
    this.assertConfigured('get_custom_domain');
    return this.request(`/services/${encodeURIComponent(serviceId)}/custom-domains/${encodeURIComponent(domainId)}`);
  }

  async deleteCustomDomain(serviceId, domainId) {
    this.assertConfigured('delete_custom_domain');
    return this.request(`/services/${encodeURIComponent(serviceId)}/custom-domains/${encodeURIComponent(domainId)}`, { method: 'DELETE' });
  }

  async request(path, options = {}) {
    const response = await fetch(`${RENDER_BASE_URL}${path}`, {
      method: options.method || 'GET',
      headers: {
        Authorization: `Bearer ${process.env.RENDER_API_KEY}`,
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const text = await response.text();
    let body = {};
    try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
    if (!response.ok) {
      const error = new Error(body?.message || body?.error || `Render API returned ${response.status}.`);
      error.status = response.status === 401 ? 401 : response.status >= 500 ? 502 : response.status;
      error.details = body;
      error.expose = true;
      throw error;
    }
    return body;
  }

  buildServicePayload(input = {}) {
    const serviceType = input.serviceType || inferServiceType(input);
    const runtime = input.runtime || input.env || 'node';
    const buildCommand = input.buildCommand || (serviceType === 'static_site' ? 'npm run build' : 'npm install && npm run build');
    const details = serviceType === 'static_site'
      ? {
          buildCommand,
          publishPath: input.outputDirectory || 'dist',
          pullRequestPreviewsEnabled: 'no',
        }
      : serviceType === 'docker'
        ? {
            plan: input.plan || 'starter',
            region: input.region || 'oregon',
          }
        : {
            env: runtime,
            plan: input.plan || 'starter',
            region: input.region || 'oregon',
            envSpecificDetails: {
              buildCommand,
              startCommand: input.startCommand || 'npm start',
            },
            ...(input.disk ? { disk: { name: input.disk.name, mountPath: input.disk.mountPath, sizeGB: Number(input.disk.sizeGB || 1) } } : {}),
          };

    const repo = input.repoUrl || input.repositoryUrl || input.sourceReference;
    const name = renderSafeName(input.serviceName || input.name || input.slug || 'glondia-site');

    // Pre-flight: catch bad configs before they hit Render
    if (!repo) {
      const err = new Error('Cannot create Render service without a source repository URL.');
      err.status = 400; err.code = 'RENDER_MISSING_REPO'; err.expose = true;
      throw err;
    }
    if (!name || name === 'glondia-site' && !input.serviceName) {
      console.warn('[render-api] Service name is generic — consider providing a specific serviceName.');
    }

    return {
      type: serviceType,
      name,
      ownerId: input.ownerId || process.env.RENDER_OWNER_ID,
      repo,
      branch: input.branch || input.productionBranch || 'main',
      rootDir: input.rootDirectory || undefined,
      serviceDetails: details,
      envVars: input.envVars || undefined,
    };
  }

  assertConfigured(action = 'render_api') {
    if (this.configured()) return;
    const error = new Error(this.configurationRequired(action).message);
    error.status = 503;
    error.code = 'RENDER_CONFIGURATION_REQUIRED';
    error.expose = true;
    error.details = this.settings();
    throw error;
  }

  configurationRequired(action) {
    return {
      status: 'configuration_required',
      action,
      provider: 'render',
      settings: this.settings(),
      message: 'Render API credentials are not configured. Add RENDER_API_KEY and RENDER_OWNER_ID to enable live Render changes.',
    };
  }
}

function inferServiceType(input = {}) {
  if (input.startCommand) return 'web_service';
  const fw = String(input.framework || '').toLowerCase();
  const serverFrameworks = ['express', 'node', 'node.js server', 'fastify', 'koa', 'hapi', 'nestjs', 'next.js', 'remix', 'sveltekit'];
  if (serverFrameworks.some(s => fw.includes(s))) return 'web_service';
  return 'static_site';
}

function renderSafeName(value) {
  return String(value || 'glondia-site').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'glondia-site';
}

export default new RenderApiService();
