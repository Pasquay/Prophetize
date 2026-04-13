import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import * as socialController from "../controllers/socialController";

const router = Router();

router.post("/follow", requireAuth, socialController.followUser);
router.post("/comments", requireAuth, socialController.createComment);
router.get("/comments/:marketId", socialController.listComments);

export default router;
