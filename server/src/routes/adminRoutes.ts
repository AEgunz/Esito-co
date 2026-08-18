import { Router } from 'express';
import { syncDatabase } from '../controllers/adminController';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = Router();

router.post('/db-sync', authenticate, authorizeAdmin, syncDatabase);

export default router;
