import renderApiService from './renderApiService.js';
import { makeId, mutateHostingStore, nowIso, readHostingStore } from './hostingStore.js';

class DomainService {
  async add(serviceId, input = {}) {
    const name = cleanDomain(input.domain || input.name || input.hostname);
    let renderDomain = null;
    if (renderApiService.configured()) renderDomain = await renderApiService.addCustomDomain(serviceId, name);
    return mutateHostingStore((store) => {
      const domain = {
        domainId: renderDomain?.customDomain?.id || renderDomain?.id || makeId('domain'),
        name,
        status: renderDomain ? 'pending_verification' : 'pending_configuration',
        verificationStatus: 'pending',
        sslStatus: 'pending',
        dnsRecords: dnsRecordsFor(name),
        renderDomain,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      store.domains[serviceId] = [domain, ...(store.domains[serviceId] || [])];
      updateDeploymentDomains(store, serviceId);
      return domain;
    });
  }

  async list(serviceId) {
    const store = await readHostingStore();
    return store.domains[serviceId] || [];
  }

  async status(serviceId, domainId) {
    const store = await readHostingStore();
    const domain = (store.domains[serviceId] || []).find((item) => item.domainId === domainId);
    if (!domain) throw notFound('Domain not found.');
    let renderDomain = null;
    if (renderApiService.configured()) renderDomain = await renderApiService.getCustomDomain(serviceId, domainId);
    return mutateHostingStore((nextStore) => {
      const item = (nextStore.domains[serviceId] || []).find((row) => row.domainId === domainId);
      if (renderDomain && item) {
        item.renderDomain = renderDomain;
        item.verificationStatus = renderDomain.verificationStatus || renderDomain.status || item.verificationStatus;
        item.sslStatus = renderDomain.certificateStatus || renderDomain.sslStatus || item.sslStatus;
        item.status = normalizeDomainStatus(item.verificationStatus, item.sslStatus);
        item.updatedAt = nowIso();
        updateDeploymentDomains(nextStore, serviceId);
      }
      return item || domain;
    });
  }

  async remove(serviceId, domainId) {
    if (renderApiService.configured()) await renderApiService.deleteCustomDomain(serviceId, domainId);
    return mutateHostingStore((store) => {
      store.domains[serviceId] = (store.domains[serviceId] || []).filter((item) => item.domainId !== domainId);
      updateDeploymentDomains(store, serviceId);
      return { deleted: true, domainId };
    });
  }
}

function cleanDomain(value) {
  const domain = String(value || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain) || domain.includes('..')) {
    const error = new Error('Enter a valid domain name, such as example.com.');
    error.status = 400;
    throw error;
  }
  return domain;
}

function dnsRecordsFor(domain) {
  return [
    { type: 'CNAME', name: domain.startsWith('www.') ? domain : `www.${domain}`, value: 'your-service.onrender.com', ttl: 300 },
    { type: 'A', name: domain.replace(/^www\./, '@'), value: '216.24.57.1', ttl: 300 },
  ];
}

function normalizeDomainStatus(verificationStatus, sslStatus) {
  if (String(verificationStatus).toLowerCase().includes('verified') && String(sslStatus).toLowerCase().includes('issued')) return 'active';
  return 'pending_verification';
}

function updateDeploymentDomains(store, serviceId) {
  const deployment = store.deployments.find((item) => item.renderServiceId === serviceId || item.deploymentId === serviceId);
  if (!deployment) return;
  deployment.domainMetadata = store.domains[serviceId] || [];
  deployment.updatedAt = nowIso();
}

function notFound(message) {
  const error = new Error(message);
  error.status = 404;
  return error;
}

export default new DomainService();

