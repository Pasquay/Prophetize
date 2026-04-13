import crypto from "crypto";
import { Response } from "express";
import { AuthRequest } from "../types/authRequest";

type Platform = "ios" | "android" | "web";
type NotificationType = "market" | "leaderboard" | "profile";

type NotificationRegistration = {
  user_id: string;
  device_token: string;
  platform: Platform;
  updated_at: string;
};

const registrations = new Map<string, NotificationRegistration>();

const PLATFORM_SET: Platform[] = ["ios", "android", "web"];
const TYPE_SET: NotificationType[] = ["market", "leaderboard", "profile"];

const ensureInt = (value: unknown): number | null => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

const buildTargetPath = (type: NotificationType, payload: Record<string, unknown>): string | null => {
  if (type === "market") {
    const marketId = ensureInt(payload.marketId);
    if (!marketId) {
      return null;
    }
    return `/marketDetails?id=${marketId}`;
  }

  if (type === "leaderboard") {
    return "/tabs/leaderboard";
  }

  if (type === "profile") {
    const profileUserId = typeof payload.profileUserId === "string" ? payload.profileUserId.trim() : "";
    if (!profileUserId) {
      return "/tabs/profile";
    }
    return `/tabs/profile?userId=${encodeURIComponent(profileUserId)}`;
  }

  return null;
};

const signTarget = (recipientUserId: string, type: NotificationType, targetPath: string): string => {
  const secret = process.env.NOTIFICATION_SIGNING_SECRET || "dev-notification-secret";
  return crypto
    .createHmac("sha256", secret)
    .update(`${recipientUserId}:${type}:${targetPath}`)
    .digest("hex");
};

export const registerNotificationChannel = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const rawToken = typeof req.body?.deviceToken === "string" ? req.body.deviceToken.trim() : "";
  const rawPlatform = typeof req.body?.platform === "string" ? req.body.platform.trim().toLowerCase() : "";

  if (!rawToken || rawToken.length > 2048) {
    return res.status(400).json({ error: "Invalid deviceToken" });
  }

  if (!PLATFORM_SET.includes(rawPlatform as Platform)) {
    return res.status(400).json({ error: "Invalid platform" });
  }

  const registration: NotificationRegistration = {
    user_id: userId,
    device_token: rawToken,
    platform: rawPlatform as Platform,
    updated_at: new Date().toISOString(),
  };

  registrations.set(userId, registration);

  return res.status(200).json({
    message: "Notification channel registered",
    registration: {
      user_id: registration.user_id,
      device_token: registration.device_token,
      platform: registration.platform,
    },
  });
};

export const triggerNotification = async (req: AuthRequest, res: Response) => {
  const actorId = req.user?.id;
  if (!actorId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const type = typeof req.body?.type === "string" ? req.body.type.trim().toLowerCase() : "";
  const recipientUserId = typeof req.body?.recipientUserId === "string" ? req.body.recipientUserId.trim() : "";
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  const body = typeof req.body?.body === "string" ? req.body.body.trim() : "";

  if (!TYPE_SET.includes(type as NotificationType)) {
    return res.status(400).json({ error: "Invalid notification type" });
  }

  if (!recipientUserId) {
    return res.status(400).json({ error: "Invalid recipientUserId" });
  }

  if (!title || !body || title.length > 120 || body.length > 280) {
    return res.status(400).json({ error: "Invalid notification message" });
  }

  const targetPath = buildTargetPath(type as NotificationType, req.body ?? {});
  if (!targetPath) {
    return res.status(400).json({ error: "Invalid notification target" });
  }

  const targetSignature = signTarget(recipientUserId, type as NotificationType, targetPath);

  return res.status(202).json({
    notification: {
      type,
      recipient_user_id: recipientUserId,
      title,
      body,
      target_path: targetPath,
      target_signature: targetSignature,
    },
  });
};
