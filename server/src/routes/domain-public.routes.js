import express from 'express';
import DomainSearchController from '../controllers/domain-search.controller.js';

const router = express.Router();

router.get('/search', DomainSearchController.searchAvailability);
router.get('/pricing', DomainSearchController.getPricing);
router.get('/suggestions', DomainSearchController.getSuggestions);

export default router;
