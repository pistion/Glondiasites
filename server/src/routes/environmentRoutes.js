import express from 'express';
import environmentController from '../controllers/environmentController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import renderServiceMiddleware from '../middleware/renderServiceMiddleware.js';
import { requireBody } from '../middleware/validationMiddleware.js';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);
router.get('/:serviceId/env', renderServiceMiddleware, environmentController.listEnvironmentVariables);
router.post('/:serviceId/env', renderServiceMiddleware, requireBody(['key', 'value']), environmentController.createEnvironmentVariable);
router.patch('/:serviceId/env/:key', renderServiceMiddleware, environmentController.updateEnvironmentVariable);
router.delete('/:serviceId/env/:key', renderServiceMiddleware, environmentController.deleteEnvironmentVariable);

export default router;

