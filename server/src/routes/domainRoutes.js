import express from 'express';
import domainController from '../controllers/domainController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import renderServiceMiddleware from '../middleware/renderServiceMiddleware.js';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);
router.post('/:serviceId/domains', renderServiceMiddleware, domainController.addDomain);
router.get('/:serviceId/domains', renderServiceMiddleware, domainController.listDomains);
router.get('/:serviceId/domains/:domainId/status', renderServiceMiddleware, domainController.getDomainStatus);
router.delete('/:serviceId/domains/:domainId', renderServiceMiddleware, domainController.deleteDomain);

export default router;

