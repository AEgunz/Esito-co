import { Router } from 'express';
import { getAllCoupons, createCoupon, deleteCoupon, validateCoupon } from '../controllers/couponController';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, authorizeAdmin, getAllCoupons);
router.post('/', authenticate, authorizeAdmin, createCoupon);
router.delete('/:id', authenticate, authorizeAdmin, deleteCoupon);
router.post('/validate', validateCoupon); // Public endpoint for customers

export default router;
