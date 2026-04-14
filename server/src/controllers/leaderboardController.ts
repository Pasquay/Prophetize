import { Request, Response } from "express";
import AuthRequest from "../types/authRequest";
import {
  getLeaderboardPage,
  getMyLeaderboardPosition as getMyLeaderboardPositionFromService,
  LeaderboardPeriod,
} from "../services/leaderboardService";

const VALID_PERIODS: LeaderboardPeriod[] = ["weekly", "all_time"];

const MAX_USERS = 100;
const DEFAULT_LIMIT = 20;

const parsePeriod = (rawPeriod: unknown): LeaderboardPeriod | null => {
  if (typeof rawPeriod !== "string") return null;
  return VALID_PERIODS.includes(rawPeriod as LeaderboardPeriod)
    ? (rawPeriod as LeaderboardPeriod)
    : null;
};

const parseOptionalInteger = (value: unknown, fallback: number): number | null => {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

export const getLeaderboard = async (req: Request, res: Response) => {
  const period = parsePeriod(req.query.period);
  if (!period) return res.status(400).json({ error: "Invalid period" });

  const page = parseOptionalInteger(req.query.page, 0);
  const limit = parseOptionalInteger(req.query.limit, DEFAULT_LIMIT);

  if (page === null || page < 0) return res.status(400).json({ error: "Invalid page" });
  if (limit === null || limit <= 0 || limit > 100) return res.status(400).json({ error: "Invalid limit" });

  // Cap so we never serve beyond rank 100
  const maxPage = Math.floor(MAX_USERS / limit) - 1;
  const clampedPage = Math.min(page, maxPage);

  try {
    const { data, meta } = await getLeaderboardPage(period, clampedPage, limit);

    // Never expose beyond rank 100
    const cappedTotal = Math.min(meta.total_records, MAX_USERS);
    const totalPages = Math.ceil(cappedTotal / limit);
    const hasNextPage = clampedPage < totalPages - 1;

    return res.status(200).json({
      data,
      meta: {
        page: clampedPage,
        limit,
        has_next_page: hasNextPage,
        total_records: cappedTotal,
        total_pages: totalPages,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message ?? "Failed to load leaderboard" });
  }
};

export const getMyLeaderboardPosition = async (req: AuthRequest, res: Response) => {
  const period = parsePeriod(req.query.period);
  if (!period) return res.status(400).json({ error: "Invalid period" });

  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });

  try {
    const result = await getMyLeaderboardPositionFromService(period, userId);
    if (!result) return res.status(404).json({ error: "No leaderboard rank found for user" });

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message ?? "Failed to load leaderboard position" });
  }
};