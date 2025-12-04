import express from 'express';
import { dashboard } from '../controllers/dashboardController.js';
import { verifyToken } from '../middleware/auth.js';
const router = express.Router();
router.get('/', verifyToken, dashboard);
export default router;
