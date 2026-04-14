// ============================================================
// portfolioRoutes.ts — Express router for /portfolio
// ============================================================

import { Router } from 'express';
import {
    getSummary,
    getChart,
    getPositionsList,
    getMarketPositionByMarketId,
    getActivity,
} from '../controllers/portfolioController';
import { requireAuth } from '../middleware/authMiddleware'; // same middleware used across your app

const router = Router();

// All portfolio routes require the user to be authenticated.
// req.user.id is extracted from the JWT by authenticateUser.

router.get('/summary', requireAuth, getSummary);
router.get('/chart', requireAuth, getChart);
router.get('/positions', requireAuth, getPositionsList);
router.get('/position/:marketId', requireAuth, getMarketPositionByMarketId);
router.get('/activity', requireAuth, getActivity);

export default router;