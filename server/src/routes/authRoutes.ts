import { Router } from 'express';
import { register, login, getAllUsers, deleteUser, updateUser } from '../controllers/authController';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', authenticate, authorizeAdmin, getAllUsers);
router.patch('/users/:id', authenticate, authorizeAdmin, updateUser);
router.delete('/users/:id', authenticate, authorizeAdmin, deleteUser);

export default router;
