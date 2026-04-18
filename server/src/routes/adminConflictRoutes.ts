import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';
import * as adminConflictController from '../controllers/adminConflictController';

const router = Router();

router.get('/conflicts', requireAuth, requireAdmin, adminConflictController.getConflicts);
router.post('/conflicts/:id/outcome', requireAuth, requireAdmin, adminConflictController.recordConflictOutcome);

export default router;
