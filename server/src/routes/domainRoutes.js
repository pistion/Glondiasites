import express from 'express';
import domainController from '../controllers/domainController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);
router.get('/:deploymentId/domains', domainController.listDomains);
router.post('/:deploymentId/domains', domainController.addDomain);
router.get('/:deploymentId/domains/:domainId/status', domainController.getDomainStatus);
router.post('/:deploymentId/domains/:domainId/verify', domainController.getDomainStatus);
router.delete('/:deploymentId/domains/:domainId', domainController.deleteDomain);

export default router;
