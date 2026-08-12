import { Router } from 'express';
import { getDeliveryFees, getDeliveryFeeByCity, upsertDeliveryFee, deleteDeliveryFee, seedDeliveryFees } from '../controllers/deliveryController';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', getDeliveryFees);
router.get('/:city', getDeliveryFeeByCity);
router.post('/', authenticate, authorizeAdmin, upsertDeliveryFee);
router.post('/seed', authenticate, authorizeAdmin, seedDeliveryFees);
router.delete('/:id', authenticate, authorizeAdmin, deleteDeliveryFee);

export default router;
