import express from 'express';
import SiteController from '../controllers/site.controller.js';
import SiteEditorController from '../controllers/site-editor.controller.js';
import PublishController from '../controllers/publish.controller.js';

const router = express.Router({ mergeParams: true });

// Site core
router.get('/', SiteController.listSites);
router.post('/', SiteController.createSite);
router.post('/from-template', SiteController.createFromTemplate);
router.get('/:siteId', SiteController.getSite);
router.patch('/:siteId', SiteController.updateSite);
router.delete('/:siteId', SiteController.deleteSite);

// Editor
router.get('/:siteId/editor-state', SiteEditorController.getEditorState);
router.patch('/:siteId/draft', SiteEditorController.saveDraft);
router.post('/:siteId/autosave', SiteEditorController.autosaveDraft);

// Publish
router.post('/:siteId/publish', PublishController.publishSite);
router.get('/:siteId/publish-status/:publishId', PublishController.getPublishStatus);

export default router;
