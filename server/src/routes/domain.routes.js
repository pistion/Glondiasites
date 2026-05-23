import express from 'express';
import DomainController from '../controllers/domain.controller.js';
import DnsRecordController from '../controllers/dns.controller.js';

const router = express.Router({ mergeParams: true });

// Domain ownership
router.get('/', DomainController.listDomains);
router.get('/:domainId', DomainController.getDomain);
router.patch('/:domainId', DomainController.updateDomain);
router.delete('/:domainId', DomainController.deleteDomain);
router.post('/:domainId/verify', DomainController.verifyDomain);
router.post('/:domainId/link-project', DomainController.linkProject);
router.post('/:domainId/toggle-auto-renew', DomainController.toggleAutoRenew);

// DNS
router.get('/:domainId/dns-records', DnsRecordController.listRecords);
router.post('/:domainId/dns-records', DnsRecordController.createRecord);
router.patch('/:domainId/dns-records/:recordId', DnsRecordController.updateRecord);
router.delete('/:domainId/dns-records/:recordId', DnsRecordController.deleteRecord);

export default router;
