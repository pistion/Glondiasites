import express from 'express';
import hostingController from '../controllers/hostingController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import renderServiceMiddleware from '../middleware/renderServiceMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', hostingController.listHosting);
router.get('/:serviceId', renderServiceMiddleware, hostingController.getHostingService);
router.patch('/:serviceId/settings', renderServiceMiddleware, hostingController.updateSettings);

export default router;

