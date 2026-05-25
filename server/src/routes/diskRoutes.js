import express from 'express';
import diskController from '../controllers/diskController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { requireBody } from '../middleware/validationMiddleware.js';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);
router.get('/:deploymentId/disk', diskController.listDisks);
router.post('/:deploymentId/disk', requireBody(['name', 'mountPath', 'sizeGB']), diskController.attachDisk);
router.patch('/:deploymentId/disk/:diskId', diskController.updateDisk);
router.delete('/:deploymentId/disk/:diskId', diskController.deleteDisk);

export default router;
