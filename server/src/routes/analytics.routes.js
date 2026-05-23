import express from 'express';
import AnalyticsController from '../controllers/analytics.controller.js';
import AuditController from '../controllers/audit.controller.js';

const router = express.Router({ mergeParams: true });

// Analytics
router.get('/summary', AnalyticsController.getWorkspaceSummary);
router.get('/traffic', AnalyticsController.getTraffic);
router.get('/conversions', AnalyticsController.getConversions);

// Audit
router.get('/audit-log', AuditController.listAuditLog);

export default router;
