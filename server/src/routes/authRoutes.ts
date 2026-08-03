import { Router } from 'express';
import { register, login, getAllUsers } from '../controllers/authController';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', authenticate, authorizeAdmin, getAllUsers);

export default router;
