import express from 'express';
import { createReview, getProductReviews } from '../controllers/reviewController';

const router = express.Router();

router.post('/', createReview);
router.get('/:productId', getProductReviews);

export default router;
