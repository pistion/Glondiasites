import express from 'express';
import { templateAiController } from '../controllers/template-ai.controller.js';

const router = express.Router();

router.post('/intake/start',            templateAiController.startIntake);
router.post('/intake/message',          templateAiController.sendMessage);
router.post('/generate',                templateAiController.generateTailored);
router.post('/sites',                   templateAiController.createSite);
router.post('/sites/:siteId/deploy',    templateAiController.deploySite);
router.get('/templates/:templateId/preview', templateAiController.getTemplatePreview);

export default router;
