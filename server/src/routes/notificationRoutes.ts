import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import * as notificationController from "../controllers/notificationController";

const router = Router();

router.post("/register", requireAuth, notificationController.registerNotificationChannel);
router.post("/trigger", requireAuth, notificationController.triggerNotification);

export default router;
