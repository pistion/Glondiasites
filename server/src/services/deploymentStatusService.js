import renderApiService from './renderApiService.js';
import { mutateHostingStore, nowIso } from './hostingStore.js';

const BUILDING_STATUSES = new Set(['created', 'queued', 'build_in_progress', 'update_in_progress', 'pre_deploy_in_progress']);
const SUCCESS_STATUSES = new Set(['live', 'deployed', 'succeeded']);
const FAILED_STATUSES = new Set(['build_failed', 'update_failed', 'pre_deploy_failed', 'canceled', 'failed']);

class DeploymentStatusService {
  normalizeStatus(renderStatus) {
    const status = String(renderStatus || '').toLowerCase();
    if (SUCCESS_STATUSES.has(status)) return { status: 'live', buildStatus: 'succeeded', currentStep: 'Verifying URL' };
    if (FAILED_STATUSES.has(status)) return { status: 'failed', buildStatus: 'failed', currentStep: 'Failed' };
    if (BUILDING_STATUSES.has(status)) return { status: 'building', buildStatus: status || 'building', currentStep: 'Building' };
    return { status: status || 'queued', buildStatus: status || 'queued', currentStep: status === 'queued' ? 'Queued' : 'Sending to Render' };
  }

  async refreshDeployment(deployment) {
    if (!deployment?.renderServiceId || !deployment?.renderDeployId || !renderApiService.configured()) {
      return deployment;
    }
    const renderDeploy = await renderApiService.getDeploy(deployment.renderServiceId, deployment.renderDeployId);
    const deploy = renderDeploy.deploy || renderDeploy;
    const next = this.normalizeStatus(deploy.status);
    return mutateHostingStore((store) => {
      const stored = store.deployments.find((item) => item.deploymentId === deployment.deploymentId);
      if (!stored) return deployment;
      Object.assign(stored, next, {
        renderDeployStatus: deploy.status || stored.renderDeployStatus,
        updatedAt: nowIso(),
        lastDeployedAt: next.status === 'live' ? nowIso() : stored.lastDeployedAt,
      });
      return stored;
    });
  }

  async verifyLiveUrl(url) {
    if (!url) return { ok: false, status: 'missing_url' };
    try {
      const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(8000) });
      return { ok: response.ok, statusCode: response.status, checkedAt: nowIso() };
    } catch (error) {
      return { ok: false, error: error.message, checkedAt: nowIso() };
    }
  }

  statusLabel(status) {
    return {
      preparing: 'Preparing',
      configuration_required: 'Preparing',
      queued: 'Queued',
      building: 'Building',
      deploying: 'Deploying',
      deployed: 'Verifying URL',
      live: 'Live',
      failed: 'Failed',
      suspended: 'Suspended',
      deleted: 'Deleted',
    }[status] || 'Preparing';
  }
}

export default new DeploymentStatusService();
