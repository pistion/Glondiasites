import express from 'express';
import environmentController from '../controllers/environmentController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { requireBody } from '../middleware/validationMiddleware.js';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);
router.get('/:deploymentId/env', environmentController.listEnvironmentVariables);
router.post('/:deploymentId/env', requireBody(['key', 'value']), environmentController.createEnvironmentVariable);
router.patch('/:deploymentId/env/:key', environmentController.updateEnvironmentVariable);
router.delete('/:deploymentId/env/:key', environmentController.deleteEnvironmentVariable);
router.post('/:deploymentId/env/sync', environmentController.syncEnvironmentVariables);

export default router;
