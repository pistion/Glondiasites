import renderApiService from './renderApiService.js';
import { mutateHostingStore, nowIso, readHostingStore } from './hostingStore.js';

class HostingService {
  async listHosting(userId) {
    const store = await readHostingStore();
    return store.deployments
      .filter((item) => !userId || item.userId === userId)
      .map((item) => this.toHostingSummary(item));
  }

  async getService(deploymentId) {
    const store = await readHostingStore();
    const deployment = store.deployments.find((item) => item.renderServiceId === deploymentId || item.deploymentId === deploymentId);
    if (!deployment) throw notFound('Hosting service not found.');
    let renderService = null;
    if (deployment.renderServiceId && renderApiService.configured()) {
      renderService = await renderApiService.getService(deployment.renderServiceId);
    }
    return { ...deployment, renderService };
  }

  async updateSettings(deploymentId, settings = {}) {
    const current = await this.getService(deploymentId);
    let renderSettings = null;
    if (current.renderServiceId && renderApiService.configured()) {
      renderSettings = await renderApiService.updateService(current.renderServiceId, settings.render || settings);
    }
    return mutateHostingStore((store) => {
      const deployment = store.deployments.find((item) => item.renderServiceId === deploymentId || item.deploymentId === deploymentId);
      deployment.environmentConfiguration = {
        ...deployment.environmentConfiguration,
        ...settings,
      };
      deployment.renderSettings = renderSettings;
      deployment.updatedAt = nowIso();
      return deployment;
    });
  }

  async suspend(deploymentId) {
    const current = await this.getService(deploymentId);
    let renderResult = null;
    if (current.renderServiceId && renderApiService.configured()) {
      renderResult = await renderApiService.suspendService(current.renderServiceId);
    }
    return mutateHostingStore((store) => {
      const deployment = store.deployments.find((item) => item.deploymentId === current.deploymentId);
      deployment.status = 'suspended';
      deployment.currentStep = 'Suspended';
      deployment.suspendedAt = nowIso();
      deployment.updatedAt = nowIso();
      deployment.renderSuspendResponse = renderResult;
      return deployment;
    });
  }

  async delete(deploymentId) {
    const current = await this.getService(deploymentId);
    let renderResult = null;
    if (current.renderServiceId && renderApiService.configured()) {
      renderResult = await renderApiService.deleteService(current.renderServiceId);
    }
    return mutateHostingStore((store) => {
      const deployment = store.deployments.find((item) => item.deploymentId === current.deploymentId);
      deployment.status = 'deleted';
      deployment.currentStep = 'Deleted';
      deployment.deletedAt = nowIso();
      deployment.updatedAt = nowIso();
      deployment.renderDeleteResponse = renderResult;
      return { deleted: true, deploymentId: current.deploymentId };
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
      currentStep: deployment.currentStep,
      liveUrl: deployment.liveUrl,
      verifiedUrl: deployment.verifiedUrl,
      urlReachable: deployment.urlReachable,
      errorMessage: deployment.errorMessage,
      githubRepo: deployment.githubRepo || deployment.repoUrl,
      githubBranch: deployment.githubBranch || deployment.environmentConfiguration?.branch,
      renderServiceId: deployment.renderServiceId,
      renderDeployId: deployment.renderDeployId,
      lastDeployedAt: deployment.lastDeployedAt,
      suspendedAt: deployment.suspendedAt,
      deletedAt: deployment.deletedAt,
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
