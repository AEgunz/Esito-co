import { Router } from 'express';
import { createOrder, getMyOrders, getAllOrders, updateOrder, deleteOrder, ameexWebhook } from '../controllers/orderController';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = Router();

router.post('/', createOrder); // Allow guest checkout
router.post('/ameex-webhook', ameexWebhook); // Public webhook endpoint
router.get('/my-orders', authenticate, getMyOrders);
router.get('/all', authenticate, authorizeAdmin, getAllOrders);
router.patch('/:id', authenticate, authorizeAdmin, updateOrder);
router.delete('/:id', authenticate, authorizeAdmin, deleteOrder);

export default router;
