import { Router } from 'express';
import { getDeliveryFees, getDeliveryFeeByCity, upsertDeliveryFee, deleteDeliveryFee } from '../controllers/deliveryController';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', getDeliveryFees);
router.get('/:city', getDeliveryFeeByCity);
router.post('/', authenticate, authorizeAdmin, upsertDeliveryFee);
router.delete('/:id', authenticate, authorizeAdmin, deleteDeliveryFee);

export default router;
