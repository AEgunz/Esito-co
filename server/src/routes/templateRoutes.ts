import { Router } from 'express';
import { getTemplates, createTemplate, deleteTemplate } from '../controllers/templateController';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', getTemplates);
router.post('/', authenticate, authorizeAdmin, createTemplate);
router.delete('/:id', authenticate, authorizeAdmin, deleteTemplate);

export default router;
