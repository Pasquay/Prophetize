import { Router } from "express";
import * as marketController from "../controllers/marketController";
import { requireAdmin } from "../middleware/adminMiddleware";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/trending", marketController.getTrendingMarkets);
router.get("/:id", marketController.getMarketById);
router.post("/create", requireAuth, marketController.createMarket);

export default router; 