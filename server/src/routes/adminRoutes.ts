import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';
import * as adminMarketOpsController from '../controllers/adminMarketOpsController';

const router = Router();

router.get('/markets/pending', requireAuth, requireAdmin, adminMarketOpsController.getPendingApprovals);
router.get('/markets/due-resolution', requireAuth, requireAdmin, adminMarketOpsController.getDueResolutions);
router.post('/markets/:id/review', requireAuth, requireAdmin, adminMarketOpsController.reviewMarket);
router.post('/markets/:id/resolve', requireAuth, requireAdmin, adminMarketOpsController.resolveMarket);

export default router;
