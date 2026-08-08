import express from 'express';
import { createReview, getProductReviews, getAllReviews, deleteReview } from '../controllers/reviewController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', createReview);
router.get('/all', protect, admin, getAllReviews);
router.get('/:productId', getProductReviews);
router.delete('/:id', protect, admin, deleteReview);

export default router;
