import { Router } from 'express';
import { getFinancialSummary, addExpense, deleteExpense } from '../controllers/financeController';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = Router();

router.use(authenticate);
router.use(authorizeAdmin);

router.get('/summary', getFinancialSummary);
router.post('/expenses', addExpense);
router.delete('/expenses/:id', deleteExpense);

export default router;
