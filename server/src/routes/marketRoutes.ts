import { Router } from "express";
import * as marketController from "../controllers/marketController";
import { requireAdmin } from "../middleware/adminMiddleware";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/all", marketController.getAllMarkets);
router.get("/trending", marketController.getTrendingMarkets);
router.post("/create", requireAuth, marketController.createMarket);
router.post("/review/:id", requireAuth, requireAdmin, marketController.reviewMarket);
router.get("/:id", marketController.getMarketById);

export default router; 