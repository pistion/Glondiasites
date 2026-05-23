import express from 'express';
import PublicSalesController from '../controllers/public-sales.controller.js';

const router = express.Router();

router.get('/:siteSlug', PublicSalesController.getPublishedSite);
router.get('/:siteSlug/products', PublicSalesController.listPublicProducts);
router.get('/:siteSlug/products/:productSlug', PublicSalesController.getPublicProduct);
router.post('/:siteSlug/leads', PublicSalesController.createLead);
router.post('/:siteSlug/checkout', PublicSalesController.createCheckout);

export default router;
