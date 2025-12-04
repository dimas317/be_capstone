import express from 'express';
import { listBadges, awardBadge } from '../controllers/badgeController.js';
import { verifyToken } from '../middleware/auth.js';
const router = express.Router();
router.get('/', verifyToken, listBadges);
router.post('/', verifyToken, awardBadge);
export default router;
