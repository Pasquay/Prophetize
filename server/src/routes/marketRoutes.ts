import { Router } from "express";
import * as marketController from "../controllers/marketController";

const router = Router();

router.get("/trending", marketController.getTrendingMarkets);
// router.get("/:id", marketController.getMarketById);

export default router; 