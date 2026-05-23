import express from 'express';
import EventTrackingController from '../controllers/event-tracking.controller.js';

const router = express.Router();

router.post('/track', EventTrackingController.trackEvent);
router.post('/batch', EventTrackingController.trackBatch);

export default router;
