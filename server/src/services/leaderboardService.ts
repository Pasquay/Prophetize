import { supabase } from "../config/supabaseClient";
import { getPaginationRange } from "../utils/pagination";

export type LeaderboardPeriod = "weekly" | "all_time";

type LeaderboardRow = {
  id: string;
  username: string;
  avatar_url: string | null;
  revenue: number;
  weekly_revenue: number;
};

export type LeaderboardItem = {
  rank: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  revenue: number;
  is_current_user: boolean;
};

export type LeaderboardMeta = {
  page: number;
  limit: number;
  has_next_page: boolean;
  total_records: number;
  total_pages: number;
};

const getSortColumn = (period: LeaderboardPeriod) =>
  period === "weekly" ? "weekly_revenue" : "revenue";

export const getLeaderboardPage = async (
  period: LeaderboardPeriod,
  page: number,
  limit: number
): Promise<{ data: LeaderboardItem[]; meta: LeaderboardMeta }> => {
  const { from, to } = getPaginationRange(page, limit);
  const sortColumn = getSortColumn(period);

  const { data, error, count } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, revenue, weekly_revenue", { count: "exact" })
    .order(sortColumn, { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const rows = (data as LeaderboardRow[] | null) ?? [];
  const totalRecords = Math.min(count ?? rows.length, 100);
  const totalPages = totalRecords > 0 ? Math.ceil(totalRecords / limit) : 0;

  return {
    data: rows.map((row, index) => ({
      rank: from + index + 1,
      user_id: row.id,
      username: row.username ?? "unknown",
      avatar_url: row.avatar_url ?? null,
      revenue: period === "weekly" ? row.weekly_revenue : row.revenue,
      is_current_user: false,
    })),
    meta: {
      page,
      limit,
      has_next_page: (page + 1) * limit < totalRecords,
      total_records: totalRecords,
      total_pages: totalPages,
    },
  };
};

export const getMyLeaderboardPosition = async (
  period: LeaderboardPeriod,
  userId: string
): Promise<{
  position: number;
  username: string;
  avatar_url: string | null;
  revenue: number;
} | null> => {
  const sortColumn = getSortColumn(period);

  // Get the user's own revenue
  const { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("username, avatar_url, revenue, weekly_revenue")
    .eq("id", userId)
    .maybeSingle();

  if (userError) throw new Error(userError.message);
  if (!userData) return null;

  const userRevenue = period === "weekly" ? userData.weekly_revenue : userData.revenue;

  // Count how many users have higher revenue to determine rank
  const { count: higherCount, error: rankError } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .gt(sortColumn, userRevenue);

  if (rankError) throw new Error(rankError.message);

  return {
    position: (higherCount ?? 0) + 1,
    username: userData.username ?? "unknown",
    avatar_url: userData.avatar_url ?? null,
    revenue: userRevenue,
  };
};