import { Router } from 'express';
import * as transactionController from '../controllers/transactionController';
import { requireAdmin } from '../middleware/adminMiddleware';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/buy', requireAuth, transactionController.buyShare);
router.post('/sell', requireAuth, transactionController.sellShare);

export default router;