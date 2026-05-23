import express from 'express';
import BillingController from '../controllers/billing.controller.js';
import UsageController from '../controllers/usage.controller.js';

const router = express.Router({ mergeParams: true });

// Billing
router.get('/summary', BillingController.getSummary);
router.get('/plans', BillingController.listPlans);
router.get('/invoices', BillingController.listInvoices);
router.post('/checkout-session', BillingController.createCheckoutSession);

// Usage
router.get('/usage/summary', UsageController.getSummary);

export default router;
