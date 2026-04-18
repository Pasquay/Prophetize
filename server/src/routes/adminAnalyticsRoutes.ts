import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';
import * as adminAnalyticsController from '../controllers/adminAnalyticsController';

const router = Router();

router.get('/analytics/operations', requireAuth, requireAdmin, adminAnalyticsController.getOperationsAnalytics);
router.get('/analytics/conflicts', requireAuth, requireAdmin, adminAnalyticsController.getConflictAnalytics);

export default router;
