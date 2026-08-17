import { Router } from 'express';
import { createInquiry, getInquiries, updateInquiryStatus, deleteInquiry } from '../controllers/inquiryController';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = Router();

router.post('/', createInquiry);
router.get('/', authenticate, authorizeAdmin, getInquiries);
router.patch('/:id', authenticate, authorizeAdmin, updateInquiryStatus);
router.delete('/:id', authenticate, authorizeAdmin, deleteInquiry);

export default router;
