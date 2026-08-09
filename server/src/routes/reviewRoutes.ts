import express from 'express';
import { createReview, getProductReviews, getAllReviews, deleteReview } from '../controllers/reviewController';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = express.Router();

router.post('/', createReview);
router.get('/all', authenticate, authorizeAdmin, getAllReviews);
router.get('/:productId', getProductReviews);
router.delete('/:id', authenticate, authorizeAdmin, deleteReview);

export default router;
