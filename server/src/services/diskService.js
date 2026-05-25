import renderApiService from './renderApiService.js';
import { makeId, mutateHostingStore, nowIso, readHostingStore } from './hostingStore.js';

class DiskService {
  async list(serviceId) {
    const store = await readHostingStore();
    return store.disks[serviceId] || [];
  }

  async attach(serviceId, input = {}) {
    const disk = validateDisk(input);
    const deployment = await findDeploymentByService(serviceId);
    if (deployment.serviceType !== 'web_service') {
      const error = new Error('Persistent disks are supported only for Render web services in this flow.');
      error.status = 400;
      throw error;
    }
    let renderDisk = null;
    if (renderApiService.configured()) renderDisk = await renderApiService.createDisk(serviceId, disk);
    return mutateHostingStore((store) => {
      const item = {
        diskId: renderDisk?.disk?.id || renderDisk?.id || makeId('disk'),
        name: disk.name,
        mountPath: disk.mountPath,
        sizeGB: disk.sizeGB,
        status: renderDisk ? 'attached' : 'pending_configuration',
        renderDisk,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      store.disks[serviceId] = [item, ...(store.disks[serviceId] || [])];
      updateDeploymentDisks(store, serviceId);
      return item;
    });
  }

  async update(serviceId, diskId, input = {}) {
    const disk = validateDisk(input, false);
    let renderDisk = null;
    if (renderApiService.configured()) renderDisk = await renderApiService.updateDisk(serviceId, diskId, disk);
    return mutateHostingStore((store) => {
      const item = (store.disks[serviceId] || []).find((row) => row.diskId === diskId);
      if (!item) throw notFound('Disk not found.');
      Object.assign(item, disk, { renderDisk, updatedAt: nowIso() });
      updateDeploymentDisks(store, serviceId);
      return item;
    });
  }

  async remove(serviceId, diskId) {
    if (renderApiService.configured()) await renderApiService.deleteDisk(serviceId, diskId);
    return mutateHostingStore((store) => {
      store.disks[serviceId] = (store.disks[serviceId] || []).filter((row) => row.diskId !== diskId);
      updateDeploymentDisks(store, serviceId);
      return { deleted: true, diskId };
    });
  }
}

function validateDisk(input = {}, requireAll = true) {
  const name = String(input.name || input.diskName || '').trim();
  const mountPath = String(input.mountPath || '').trim();
  const sizeGB = Number(input.sizeGB || input.size || 1);
  if (requireAll && !name) throw validationError('Disk name is required.');
  if (name && !/^[a-zA-Z0-9][a-zA-Z0-9-_]{1,62}$/.test(name)) throw validationError('Disk name must be 2-63 letters, numbers, hyphens, or underscores.');
  if (requireAll && !mountPath) throw validationError('Mount path is required.');
  if (mountPath && (!mountPath.startsWith('/') || mountPath.includes('..'))) throw validationError('Mount path must be an absolute path and cannot contain "..".');
  if (!Number.isFinite(sizeGB) || sizeGB < 1 || sizeGB > 1024) throw validationError('Disk size must be between 1 GB and 1024 GB.');
  return { name, mountPath, sizeGB };
}

async function findDeploymentByService(serviceId) {
  const store = await readHostingStore();
  const deployment = store.deployments.find((item) => item.renderServiceId === serviceId || item.deploymentId === serviceId);
  if (!deployment) throw notFound('Hosting service not found.');
  return deployment;
}

function updateDeploymentDisks(store, serviceId) {
  const deployment = store.deployments.find((item) => item.renderServiceId === serviceId || item.deploymentId === serviceId);
  if (!deployment) return;
  deployment.diskMetadata = store.disks[serviceId] || [];
  deployment.updatedAt = nowIso();
}

function validationError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function notFound(message) {
  const error = new Error(message);
  error.status = 404;
  return error;
}

export default new DiskService();
