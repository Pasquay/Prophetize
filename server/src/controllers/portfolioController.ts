// ============================================================
// portfolioController.ts — HTTP handlers for portfolio routes
// ============================================================

import { Response } from 'express';
import { AuthRequest } from '../types/authRequest';
import {
  getPortfolioSummary,
  getNetWorthHistory,
  getPositions,
  getTransactionHistory,
} from '../services/portfolioService';
import { PositionTab, SortBy, TimeRange } from '../types/portfolio';

// ─────────────────────────────────────────────────────────────
// GET /portfolio/summary
// Returns: username, avatar, joined, balance,
//          positions_value, net_worth, biggest_win, predictions_count
//
// Postman: GET http://localhost:3000/portfolio/summary
//          Headers: Authorization: Bearer <token>
// ─────────────────────────────────────────────────────────────
export const getSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const summary = await getPortfolioSummary(userId);
    return res.status(200).json(summary);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /portfolio/chart?range=1D|1W|1M|ALL
// Returns: array of { snapshot_date, net_worth, period }
//
// Postman: GET http://localhost:3000/portfolio/chart?range=1M
//          Headers: Authorization: Bearer <token>
// ─────────────────────────────────────────────────────────────
export const getChart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const range = (req.query.range as TimeRange) || 'ALL';

    const validRanges: TimeRange[] = ['1D', '1W', '1M', 'ALL'];
    if (!validRanges.includes(range)) {
      return res.status(400).json({ error: "Invalid range. Use '1D', '1W', '1M', or 'ALL'." });
    }

    const history = await getNetWorthHistory(userId, range);
    return res.status(200).json(history);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /portfolio/positions?tab=active|closed&search=&sort=value|pl|newest
// Returns: array of enriched position cards
//
// Postman: GET http://localhost:3000/portfolio/positions?tab=active&sort=pl
//          GET http://localhost:3000/portfolio/positions?tab=closed&search=patriots
//          Headers: Authorization: Bearer <token>
// ─────────────────────────────────────────────────────────────
export const getPositionsList = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const tab = (req.query.tab as PositionTab) || 'active';
    const search = (req.query.search as string) || '';
    const sort = (req.query.sort as SortBy) || 'newest';

    const validTabs: PositionTab[] = ['active', 'closed'];
    const validSorts: SortBy[] = ['value', 'pl', 'newest'];

    if (!validTabs.includes(tab)) {
      return res.status(400).json({ error: "Invalid tab. Use 'active' or 'closed'." });
    }
    if (!validSorts.includes(sort)) {
      return res.status(400).json({ error: "Invalid sort. Use 'value', 'pl', or 'newest'." });
    }

    const positions = await getPositions(userId, tab, search, sort);
    return res.status(200).json(positions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /portfolio/activity
// Returns: full chronological transaction history
//
// Postman: GET http://localhost:3000/portfolio/activity
//          Headers: Authorization: Bearer <token>
// ─────────────────────────────────────────────────────────────
export const getActivity = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const transactions = await getTransactionHistory(userId);
    return res.status(200).json(transactions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};