import express from 'express';
import * as ctrl from '../controllers/vpsHostingController.js';

const router = express.Router();

// Catalog
router.get('/settings',           ctrl.getSettings);
router.get('/regions',            ctrl.listRegions);
router.get('/plans',              ctrl.listPlans);
router.get('/os',                 ctrl.listOs);
router.post('/quote',             ctrl.quote);

// Direct deploy (requires VPS_DIRECT_DEPLOY_ENABLED=true)
router.post('/services',          ctrl.createService);

// PayPal
router.post('/paypal/create-order', ctrl.createPaypalOrder);
router.post('/paypal/capture',      ctrl.capturePaypalOrder);

// Service management
router.get('/services',               ctrl.listServices);
router.get('/services/:id',           ctrl.getService);
router.post('/services/:id/start',    ctrl.startService);
router.post('/services/:id/halt',     ctrl.haltService);
router.post('/services/:id/reboot',   ctrl.rebootService);
router.delete('/services/:id',        ctrl.destroyService);

// SSH keys
router.get('/ssh-keys',               ctrl.listSshKeys);
router.delete('/ssh-keys/:keyId',     ctrl.deleteSshKey);

// Bandwidth
router.get('/services/:id/bandwidth', ctrl.getBandwidth);

// Snapshots
router.get('/snapshots',                      ctrl.listSnapshots);
router.post('/services/:id/snapshots',        ctrl.createSnapshot);
router.delete('/snapshots/:snapshotId',       ctrl.deleteSnapshot);
router.post('/services/:id/restore',          ctrl.restoreService);

// Backup schedule
router.get('/services/:id/backup-schedule',   ctrl.getBackupSchedule);
router.post('/services/:id/backup-schedule',  ctrl.setBackupSchedule);

// Resize / reinstall
router.patch('/services/:id/resize',          ctrl.resizeService);
router.post('/services/:id/reinstall',        ctrl.reinstallService);

export default router;
