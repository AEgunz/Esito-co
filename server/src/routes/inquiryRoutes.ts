import { Router } from 'express';
import { createInquiry, getInquiries, updateInquiryStatus, deleteInquiry, replyToInquiry, receiveEmailWebhook } from '../controllers/inquiryController';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = Router();

router.post('/', createInquiry);
router.post('/webhook', receiveEmailWebhook); // Public for email services
router.get('/', authenticate, authorizeAdmin, getInquiries);
router.post('/:id/reply', authenticate, authorizeAdmin, replyToInquiry);
router.patch('/:id', authenticate, authorizeAdmin, updateInquiryStatus);
router.delete('/:id', authenticate, authorizeAdmin, deleteInquiry);

export default router;
