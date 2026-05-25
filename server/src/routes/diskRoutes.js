import express from 'express';
import diskController from '../controllers/diskController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import renderServiceMiddleware from '../middleware/renderServiceMiddleware.js';
import { requireBody } from '../middleware/validationMiddleware.js';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);
router.post('/:serviceId/disk', renderServiceMiddleware, requireBody(['name', 'mountPath', 'sizeGB']), diskController.attachDisk);
router.patch('/:serviceId/disk/:diskId', renderServiceMiddleware, diskController.updateDisk);
router.delete('/:serviceId/disk/:diskId', renderServiceMiddleware, diskController.deleteDisk);

export default router;

