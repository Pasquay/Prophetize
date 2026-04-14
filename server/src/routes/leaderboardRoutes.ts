import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import * as leaderboardController from "../controllers/leaderboardController";

const router = Router();

router.get("/", leaderboardController.getLeaderboard);
router.get("/me", requireAuth, leaderboardController.getMyLeaderboardPosition);

export default router;
