import express from 'express';
import TemplateController from '../controllers/template.controller.js';

const router = express.Router();

router.get('/', TemplateController.listTemplates);
router.get('/categories', TemplateController.listCategories);
router.get('/:templateId', TemplateController.getTemplate);
router.get('/:templateId/preview', TemplateController.getTemplatePreview);

export default router;
