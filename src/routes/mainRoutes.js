import express from 'express';
import {getUser} from '../controllers/userController.js';
import {listAllTransactions} from '../controllers/transactionController.js';
import {listAllBadges} from '../controllers/badgeController.js';

const router = express.Router();

// GET all or user basic
router.get("/users", getUser);

// GET all verifyToken
router.get("/transactions", listAllTransactions);

// GET all badges users
router.get("/badges", listAllBadges);

export default router;



