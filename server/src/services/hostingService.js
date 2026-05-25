import renderApiService from './renderApiService.js';
import { mutateHostingStore, nowIso, readHostingStore } from './hostingStore.js';

class HostingService {
  async listHosting(userId) {
    const store = await readHostingStore();
    return store.deployments
      .filter((item) => !userId || item.userId === userId)
      .map((item) => this.toHostingSummary(item));
  }

  async getService(serviceId) {
    const store = await readHostingStore();
    const deployment = store.deployments.find((item) => item.renderServiceId === serviceId || item.deploymentId === serviceId);
    if (!deployment) throw notFound('Hosting service not found.');
    let renderService = null;
    if (deployment.renderServiceId && renderApiService.configured()) {
      renderService = await renderApiService.getService(deployment.renderServiceId);
    }
    return { ...deployment, renderService };
  }

  async updateSettings(serviceId, settings = {}) {
    const current = await this.getService(serviceId);
    let renderSettings = null;
    if (current.renderServiceId && renderApiService.configured()) {
      renderSettings = await renderApiService.updateService(current.renderServiceId, settings.render || settings);
    }
    return mutateHostingStore((store) => {
      const deployment = store.deployments.find((item) => item.renderServiceId === serviceId || item.deploymentId === serviceId);
      deployment.environmentConfiguration = {
        ...deployment.environmentConfiguration,
        ...settings,
      };
      deployment.renderSettings = renderSettings;
      deployment.updatedAt = nowIso();
      return deployment;
    });
  }

  toHostingSummary(deployment) {
    return {
      serviceId: deployment.renderServiceId || deployment.deploymentId,
      deploymentId: deployment.deploymentId,
      projectId: deployment.projectId,
      serviceName: deployment.serviceName,
      serviceType: deployment.serviceType,
      status: deployment.status,
      buildStatus: deployment.buildStatus,
      liveUrl: deployment.liveUrl,
      lastDeployedAt: deployment.lastDeployedAt,
      updatedAt: deployment.updatedAt,
      environmentConfiguration: deployment.environmentConfiguration,
      environmentVariablesMetadata: deployment.environmentVariablesMetadata,
      diskMetadata: deployment.diskMetadata,
      domainMetadata: deployment.domainMetadata,
    };
  }
}

function notFound(message) {
  const error = new Error(message);
  error.status = 404;
  return error;
}

export default new HostingService();

