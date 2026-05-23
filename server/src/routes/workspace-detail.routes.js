import express from 'express';
import OverviewController from '../controllers/overview.controller.js';
import ActivityController from '../controllers/activity.controller.js';

const router = express.Router({ mergeParams: true });

router.get('/overview', OverviewController.getOverview);
router.get('/overview/stats', OverviewController.getStats);
router.get('/overview/next-actions', OverviewController.getNextActions);
router.get('/activity', ActivityController.listActivity);

export default router;
