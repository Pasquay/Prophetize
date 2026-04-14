import { Request, Response } from "express";
import { AuthRequest } from "../types/authRequest";

type SocialComment = {
  id: string;
  market_id: number;
  user_id: string;
  content: string;
  created_at: string;
};

const followGraph = new Map<string, Set<string>>();
const commentsByMarket = new Map<number, SocialComment[]>();
let commentCounter = 1;

const sanitizeComment = (value: string): string => {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim();
};

const parseMarketId = (value: unknown): number | null => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

export const followUser = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const targetUserId = typeof req.body?.targetUserId === "string" ? req.body.targetUserId.trim() : "";
  const actionRaw = typeof req.body?.action === "string" ? req.body.action.trim().toLowerCase() : "follow";
  const action = actionRaw || "follow";

  if (!targetUserId || targetUserId.length > 128) {
    return res.status(400).json({ error: "Invalid targetUserId" });
  }

  if (targetUserId === userId) {
    return res.status(400).json({ error: "Cannot follow yourself" });
  }

  if (action !== "follow" && action !== "unfollow") {
    return res.status(400).json({ error: "Invalid action" });
  }

  const current = followGraph.get(userId) ?? new Set<string>();
  if (action === "follow") {
    current.add(targetUserId);
  } else {
    current.delete(targetUserId);
  }

  followGraph.set(userId, current);

  return res.status(200).json({
    relationship: {
      user_id: userId,
      target_user_id: targetUserId,
      following: current.has(targetUserId),
    },
  });
};

export const createComment = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const marketId = parseMarketId(req.body?.marketId);
  if (!marketId) {
    return res.status(400).json({ error: "Invalid marketId" });
  }

  const rawContent = typeof req.body?.content === "string" ? req.body.content : "";
  if (!rawContent.trim()) {
    return res.status(400).json({ error: "Comment is required" });
  }

  if (rawContent.length > 280) {
    return res.status(400).json({ error: "Comment must be 280 characters or less" });
  }

  const content = sanitizeComment(rawContent);
  if (!content) {
    return res.status(400).json({ error: "Comment is required" });
  }

  const comment: SocialComment = {
    id: `c_${commentCounter++}`,
    market_id: marketId,
    user_id: userId,
    content,
    created_at: new Date().toISOString(),
  };

  const current = commentsByMarket.get(marketId) ?? [];
  current.push(comment);
  commentsByMarket.set(marketId, current);

  return res.status(201).json({ comment });
};

export const listComments = async (req: Request, res: Response) => {
  const marketId = parseMarketId(req.params.marketId);
  if (!marketId) {
    return res.status(400).json({ error: "Invalid marketId" });
  }

  return res.status(200).json({
    data: commentsByMarket.get(marketId) ?? [],
  });
};
