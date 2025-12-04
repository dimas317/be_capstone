import express from 'express';
import { stats } from '../controllers/statsController.js';
import { verifyToken } from '../middleware/auth.js';
const router = express.Router();
router.get('/', verifyToken, stats);
export default router;
    