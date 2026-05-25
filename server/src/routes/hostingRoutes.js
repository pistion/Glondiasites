import express from 'express';
import hostingController from '../controllers/hostingController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', hostingController.listHosting);
router.get('/:deploymentId', hostingController.getHostingService);
router.patch('/:deploymentId/settings', hostingController.updateSettings);
router.post('/:deploymentId/suspend', hostingController.suspendHostingService);
router.delete('/:deploymentId', hostingController.deleteHostingService);

export default router;
