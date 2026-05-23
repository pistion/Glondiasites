import express from 'express';
import PublicController from '../controllers/public.controller.js';

const router = express.Router();

router.get('/brand', PublicController.getBrand);
router.get('/templates/featured', PublicController.getFeaturedTemplates);
router.get('/plans', PublicController.getPlans);
router.post('/leads', PublicController.createLead);
router.post('/contact', PublicController.createContact);

export default router;
