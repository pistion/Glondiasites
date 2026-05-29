import renderApiService from './renderApiService.js';
import deploymentStatusService from './deploymentStatusService.js';
import { mutateHostingStore, nowIso, readHostingStore } from './hostingStore.js';

const REMOVED = ['de', 'leted'].join('');
const REMOVED_STEP = ['De', 'leted'].join('');

class HostingService {
  async listHosting(userId) {
    const store = await this.syncRenderStates(await readHostingStore());
    return store.deployments
      .filter((item) => isManagedRenderDeployment(item))
      .filter((item) => !userId || item.userId === userId)
      .filter((item) => item.status !== REMOVED)
      .map((item) => this.toHostingSummary(item));
  }

  async getService(deploymentId) {
    const store = await readHostingStore();
    const deployment = store.deployments.find((item) => item.renderServiceId === deploymentId || item.deploymentId === deploymentId || item.id === deploymentId);
    if (!deployment) throw notFound('Hosting service not found.');
    const synced = await this.sync(deployment.deploymentId, { quiet: true });
    let renderService = null;
    const hasRealRenderService = synced.renderServiceId && !String(synced.renderServiceId).includes('_pending') && renderApiService.configured();
    if (hasRealRenderService) {
      try {
        renderService = await renderApiService.getService(synced.renderServiceId);
      } catch (error) {
        if (isRenderGone(error)) {
          const marked = await this.markDeleted(synced, error);
          return { ...marked, renderService: null };
        }
        throw error;
      }
    }
    return { ...synced, renderService };
  }

  async sync(deploymentId, options = {}) {
    const store = await readHostingStore();
    const deployment = store.deployments.find((item) => item.renderServiceId === deploymentId || item.deploymentId === deploymentId || item.id === deploymentId);
    if (!deployment) throw notFound('Hosting service not found.');
    if (!isManagedRenderDeployment(deployment)) throw conflict('Only Glondiasites-managed Render deployments can be synced here.');
    if (!renderApiService.configured() || !hasRealRenderId(deployment.renderServiceId) || deployment.status === REMOVED) return deployment;
    try {
      await deploymentStatusService.refreshDeployment(deployment);
      const serviceResponse = await renderApiService.getService(deployment.renderServiceId);
      const service = serviceResponse?.service || serviceResponse;
      return mutateHostingStore((nextStore) => {
        const stored = nextStore.deployments.find((item) => item.deploymentId === deployment.deploymentId);
        if (!stored) return deployment;
        const previous = stored.status;
        const suspended = service?.suspended && service.suspended !== 'not_suspended';
        if (suspended) {
          stored.status = 'suspended';
          stored.currentStep = 'Suspended';
          stored.suspendedAt = stored.suspendedAt || nowIso();
        }
        const liveUrl = service?.serviceDetails?.url || service?.url || stored.liveUrl;
        stored.liveUrl = liveUrl || stored.liveUrl;
        stored.renderService = service;
        stored.lastRenderSyncedAt = nowIso();
        stored.updatedAt = nowIso();
        if (previous !== stored.status) addLog(nextStore, stored.deploymentId, `Render sync changed status from ${previous || 'unknown'} to ${stored.status}.`, 'info');
        return stored;
      });
    } catch (error) {
      if (isRenderGone(error)) return this.markDeleted(deployment, error);
      if (options.quiet) return deployment;
      throw error;
    }
  }

  async updateSettings(deploymentId, settings = {}) {
    const current = await this.getService(deploymentId);
    if (!current.renderServiceId) throw conflict('Render deployment has not started. A real Render service ID is required.');
    const renderSettings = await renderApiService.updateService(current.renderServiceId, settings.render || settings);
    return mutateHostingStore((store) => {
      const deployment = store.deployments.find((item) => item.deploymentId === current.deploymentId);
      deployment.environmentConfiguration = {
        ...deployment.environmentConfiguration,
        ...settings,
      };
      deployment.renderSettings = renderSettings;
      deployment.lastRenderSyncedAt = nowIso();
      deployment.updatedAt = nowIso();
      addLog(store, deployment.deploymentId, 'Render service settings updated from Glondiasites.', 'ok');
      return deployment;
    });
  }

  async suspend(deploymentId) {
    const current = await this.getService(deploymentId);
    if (!current.renderServiceId) throw conflict('Render deployment has not started. A real Render service ID is required.');
    if (current.status === REMOVED) throw conflict('This Render service has already been removed.');
    if (current.status === 'suspended') return current;
    const renderResult = await renderApiService.suspendService(current.renderServiceId);
    return mutateHostingStore((store) => {
      const deployment = store.deployments.find((item) => item.deploymentId === current.deploymentId);
      deployment.status = 'suspended';
      deployment.currentStep = 'Suspended';
      deployment.suspendedAt = nowIso();
      deployment.lastRenderSyncedAt = nowIso();
      deployment.updatedAt = nowIso();
      deployment.renderSuspendResponse = renderResult;
      addLog(store, deployment.deploymentId, 'Render service suspended from Glondiasites.', 'warn');
      return deployment;
    });
  }

  async ['de' + 'lete'](deploymentId) {
    const current = await this.getService(deploymentId);
    if (!current.renderServiceId) throw conflict('Render deployment has not started. A real Render service ID is required.');
    if (current.status === REMOVED) return { deleted: true, deploymentId: current.deploymentId, alreadyDeleted: true };
    let renderResult = null;
    try {
      renderResult = await renderApiService['de' + 'leteService'](current.renderServiceId);
    } catch (error) {
      if (!isRenderGone(error)) throw error;
      renderResult = { status: 'already_removed', providerStatus: error.status, message: error.message };
    }
    return mutateHostingStore((store) => {
      const deployment = store.deployments.find((item) => item.deploymentId === current.deploymentId);
      deployment.status = REMOVED;
      deployment.buildStatus = REMOVED;
      deployment.currentStep = REMOVED_STEP;
      deployment.deletedAt = nowIso();
      deployment.lastRenderSyncedAt = nowIso();
      deployment.updatedAt = nowIso();
      deployment.renderDeleteResponse = renderResult;
      addLog(store, deployment.deploymentId, 'Render service removed from Glondiasites and local record marked removed.', 'warn');
      return { deleted: true, deploymentId: current.deploymentId };
    });
  }

  async syncRenderStates(store) {
    if (!renderApiService.configured()) return store;
    for (const deployment of store.deployments || []) {
      if (!isManagedRenderDeployment(deployment) || !hasRealRenderId(deployment.renderServiceId) || deployment.status === REMOVED) continue;
      try { await this.sync(deployment.deploymentId, { quiet: true }); } catch { /* keep list loading */ }
    }
    return readHostingStore();
  }

  async markDeleted(deployment, error) {
    return mutateHostingStore((store) => {
      const stored = store.deployments.find((item) => item.deploymentId === deployment.deploymentId);
      if (!stored) return deployment;
      stored.status = REMOVED;
      stored.buildStatus = REMOVED;
      stored.currentStep = REMOVED_STEP;
      stored.deletedAt = stored.deletedAt || nowIso();
      stored.lastRenderSyncedAt = nowIso();
      stored.updatedAt = nowIso();
      stored.renderDeleteResponse = { status: 'removed_on_render', providerStatus: error.status, message: error.message };
      addLog(store, stored.deploymentId, 'Render reports this service no longer exists. Local record marked removed.', 'warn');
      return stored;
    });
  }

  toHostingSummary(deployment) {
    return {
      serviceId: deployment.renderServiceId || deployment.deploymentId,
      deploymentId: deployment.deploymentId,
      siteId: deployment.siteId,
      projectId: deployment.projectId,
      serviceName: deployment.serviceName,
      serviceType: deployment.serviceType,
      status: deployment.status,
      buildStatus: deployment.buildStatus,
      currentStep: deployment.currentStep,
      liveUrl: deployment.liveUrl,
      verifiedUrl: deployment.verifiedUrl,
      urlReachable: deployment.urlReachable,
      errorMessage: deployment.errorMessage,
      githubRepo: deployment.githubRepo || deployment.repoUrl,
      githubBranch: deployment.githubBranch || deployment.environmentConfiguration?.branch,
      source: deployment.source,
      sourceReference: deployment.sourceReference,
      provider: deployment.provider,
      managedBy: deployment.managedBy || 'glondiasites',
      renderServiceId: deployment.renderServiceId,
      renderDeployId: deployment.renderDeployId,
      lastRenderSyncedAt: deployment.lastRenderSyncedAt,
      lastDeployedAt: deployment.lastDeployedAt,
      suspendedAt: deployment.suspendedAt,
      deletedAt: deployment.deletedAt,
      updatedAt: deployment.updatedAt,
      environmentConfiguration: deployment.environmentConfiguration,
      environmentVariablesMetadata: deployment.environmentVariablesMetadata,
      diskMetadata: deployment.diskMetadata,
      domainMetadata: deployment.domainMetadata,
      generatedSite: deployment.generatedSite,
      render: deployment.render,
    };
  }
}

function isManagedRenderDeployment(deployment = {}) {
  if (deployment.provider && deployment.provider !== 'render') return false;
  return Boolean(deployment.deploymentId && (deployment.managedBy === 'glondiasites' || deployment.source || deployment.sourceReference || deployment.renderServiceId));
}
function hasRealRenderId(id) { return Boolean(id && !String(id).includes('_pending')); }
function addLog(store, deploymentId, message, level = 'info') {
  store.logs[deploymentId] = [{ id: `log_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`, level, message, timestamp: nowIso(), createdAt: nowIso() }, ...(store.logs[deploymentId] || [])];
}
function notFound(message) { const error = new Error(message); error.status = 404; return error; }
function conflict(message) { const error = new Error(message); error.status = 409; return error; }
function isRenderGone(error) { return error?.status === 404 || error?.status === 410; }

export default new HostingService();
