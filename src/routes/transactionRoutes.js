import express from 'express';
import { listTransactions, addTransaction, updateTransaction, deleteTransaction } from '../controllers/transactionController.js';
import { verifyToken } from '../middleware/auth.js';
const router = express.Router();
router.get('/', verifyToken, listTransactions);
router.post('/', verifyToken, addTransaction);
router.put('/:id', verifyToken, updateTransaction);
router.delete('/:id', verifyToken, deleteTransaction);
export default router;
