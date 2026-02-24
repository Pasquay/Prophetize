import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import * as userController from "../controllers/userController";

const router = Router();

// User Routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", requireAuth, userController.logout);
router.get("/profile", requireAuth, userController.getMyProfile);

export default router;