import { Router } from 'express';
import {
    getCategories, createCategory, updateCategory, deleteCategory,
    createSubCategory, deleteSubCategory,
    createChildCategory, deleteChildCategory
} from '../controllers/categoryController';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticate, authorizeAdmin, createCategory);
router.patch('/:id', authenticate, authorizeAdmin, updateCategory);
router.delete('/:id', authenticate, authorizeAdmin, deleteCategory);

// SubCategories (Level 2)
router.post('/sub', authenticate, authorizeAdmin, createSubCategory);
router.delete('/sub/:id', authenticate, authorizeAdmin, deleteSubCategory);

// ChildCategories (Level 3)
router.post('/child', authenticate, authorizeAdmin, createChildCategory);
router.delete('/child/:id', authenticate, authorizeAdmin, deleteChildCategory);

export default router;
