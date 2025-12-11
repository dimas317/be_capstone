import express from 'express';
import {getUser} from '../controllers/userController.js';
import {listAllTransactions} from '../controllers/transactionController.js';

const router = express.Router();

// GET all or user basic
router.get("/users", getUser);

// GET all verifyToken
router.get("/transactions", listAllTransactions);

export default router;



