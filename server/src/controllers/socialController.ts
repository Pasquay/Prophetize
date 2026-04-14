import { Request, Response } from "express";
import { AuthRequest } from "../types/authRequest";
import { supabase } from "../config/supabaseClient";

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

const isSupabaseCommentsUnsupported = (errorMessage: string | undefined): boolean => {
  if (!errorMessage) {
    return false;
  }

  const normalized = errorMessage.toLowerCase();
  return normalized.includes('does not exist') || normalized.includes('relation') || normalized.includes('schema cache');
};

const saveCommentFallback = (comment: SocialComment): SocialComment => {
  const current = commentsByMarket.get(comment.market_id) ?? [];
  current.push(comment);
  commentsByMarket.set(comment.market_id, current);
  return comment;
};

const listCommentFallback = (marketId: number): SocialComment[] => {
  return commentsByMarket.get(marketId) ?? [];
};

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

  const fallbackComment: SocialComment = {
    id: `c_${commentCounter++}`,
    market_id: marketId,
    user_id: userId,
    content,
    created_at: new Date().toISOString(),
  };

  try {
    const query = supabase
      .from('comments')
      .insert({
        market_id: marketId,
        user_id: userId,
        content,
      })
      .select('id, market_id, user_id, content, created_at')
      .single();

    const result = await query;
    const row = result?.data as Partial<SocialComment> | null;
    const error = result?.error ?? null;

    if (error) {
      if (isSupabaseCommentsUnsupported(error.message)) {
        return res.status(201).json({ comment: saveCommentFallback(fallbackComment) });
      }
      return res.status(500).json({ error: error.message || 'Failed to create comment' });
    }

    if (!row) {
      return res.status(201).json({ comment: saveCommentFallback(fallbackComment) });
    }

    return res.status(201).json({
      comment: {
        id: typeof row.id === 'string' ? row.id : fallbackComment.id,
        market_id: typeof row.market_id === 'number' ? row.market_id : marketId,
        user_id: typeof row.user_id === 'string' ? row.user_id : userId,
        content: typeof row.content === 'string' ? sanitizeComment(row.content) : content,
        created_at: typeof row.created_at === 'string' ? row.created_at : fallbackComment.created_at,
      },
    });
  } catch {
    return res.status(201).json({ comment: saveCommentFallback(fallbackComment) });
  }
};

export const listComments = async (req: Request, res: Response) => {
  const marketId = parseMarketId(req.params.marketId);
  if (!marketId) {
    return res.status(400).json({ error: "Invalid marketId" });
  }

  try {
    const query = supabase
      .from('comments')
      .select('id, market_id, user_id, content, created_at')
      .eq('market_id', marketId)
      .order('created_at', { ascending: false })
      .limit(200);

    const result = await query;
    const rows = Array.isArray(result?.data) ? result.data : null;
    const error = result?.error ?? null;

    if (error) {
      if (isSupabaseCommentsUnsupported(error.message)) {
        return res.status(200).json({ data: listCommentFallback(marketId) });
      }
      return res.status(500).json({ error: error.message || 'Failed to list comments' });
    }

    if (!rows) {
      return res.status(200).json({ data: listCommentFallback(marketId) });
    }

    const normalized = rows.map((row: any, index: number) => ({
      id: typeof row.id === 'string' && row.id ? row.id : `c_fallback_${marketId}_${index}`,
      market_id: typeof row.market_id === 'number' ? row.market_id : marketId,
      user_id: typeof row.user_id === 'string' ? row.user_id : 'anonymous',
      content: sanitizeComment(typeof row.content === 'string' ? row.content : ''),
      created_at: typeof row.created_at === 'string' ? row.created_at : new Date().toISOString(),
    }));

    return res.status(200).json({ data: normalized });
  } catch {
    return res.status(200).json({ data: listCommentFallback(marketId) });
  }
};
