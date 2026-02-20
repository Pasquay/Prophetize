import { Router } from "express";
import { getAllMarkets, getMarketById } from "../controllers/marketController";

const router = Router();

router.get("/", getAllMarkets);
router.get("/:id", getMarketById);

export default router;