import express from 'express';
import WorkspaceSettingsController from '../controllers/workspace-settings.controller.js';
import ApiKeyController from '../controllers/api-key.controller.js';
import NotificationController from '../controllers/notification.controller.js';

const router = express.Router({ mergeParams: true });

// Settings
router.get('/', WorkspaceSettingsController.getSettings);
router.patch('/', WorkspaceSettingsController.updateSettings);

// API Keys
router.get('/api-keys', ApiKeyController.listApiKeys);
router.post('/api-keys', ApiKeyController.createApiKey);

// Notifications
router.get('/notifications', NotificationController.listNotifications);
router.patch('/notifications/:notificationId/read', NotificationController.markRead);

export default router;
