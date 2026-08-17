import { Router } from 'express';
import { getFinancialSummary, addExpense, deleteExpense, addManualIncome, deleteManualIncome } from '../controllers/financeController';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = Router();

router.use(authenticate);
router.use(authorizeAdmin);

router.get('/summary', getFinancialSummary);
router.post('/expenses', addExpense);
router.delete('/expenses/:id', deleteExpense);
router.post('/income', addManualIncome);
router.delete('/income/:id', deleteManualIncome);

export default router;
