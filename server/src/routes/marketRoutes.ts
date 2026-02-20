import { Router } from "express";
import * as marketController from "../controllers/marketController";

const router = Router();

router.get("/", marketController.getAllMarkets);
router.get("/:id", marketController.getMarketById);

export default router; 