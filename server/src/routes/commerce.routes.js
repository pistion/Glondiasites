import express from 'express';
import ProductController from '../controllers/product.controller.js';
import LeadController from '../controllers/lead.controller.js';
import OrderController from '../controllers/order.controller.js';

const router = express.Router({ mergeParams: true });

// Products
router.get('/products', ProductController.listProducts);
router.post('/products', ProductController.createProduct);
router.get('/products/:productId', ProductController.getProduct);
router.patch('/products/:productId', ProductController.updateProduct);

// Leads
router.get('/leads', LeadController.listLeads);
router.post('/leads', LeadController.createLead);
router.get('/leads/:leadId', LeadController.getLead);
router.post('/leads/:leadId/convert-to-customer', LeadController.convertToCustomer);

// Orders
router.get('/orders', OrderController.listOrders);
router.get('/orders/:orderId', OrderController.getOrder);
router.patch('/orders/:orderId/status', OrderController.updateStatus);

export default router;
