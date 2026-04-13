import { supabase } from "../config/supabaseClient";
import { getPaginationRange } from "../utils/pagination";

export type LeaderboardPeriod = "weekly" | "all_time";

type LeaderboardRow = {
  user_id: string;
  wins: number;
  profit_pct: number;
  profiles:
    | {
        username: string;
        avatar_url: string | null;
      }
    | {
        username: string;
        avatar_url: string | null;
      }[]
    | null;
};

type LeaderboardMeRow = {
  wins: number;
  profit_pct: number;
  profiles:
    | {
        username: string;
        avatar_url: string | null;
      }
    | {
        username: string;
        avatar_url: string | null;
      }[]
    | null;
};

type ProfileShape = {
  username: string;
  avatar_url: string | null;
};

const getProfile = (rawProfile: LeaderboardRow["profiles"] | LeaderboardMeRow["profiles"]): ProfileShape | null => {
  if (!rawProfile) {
    return null;
  }

  return Array.isArray(rawProfile) ? rawProfile[0] ?? null : rawProfile;
};

export type LeaderboardItem = {
  rank: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  wins: number;
  profit_pct: number;
  is_current_user: boolean;
};

export type LeaderboardMeta = {
  page: number;
  limit: number;
  has_next_page: boolean;
  total_records: number;
  total_pages: number;
};

const mapRow = (row: LeaderboardRow, rank: number): LeaderboardItem => {
  const profile = getProfile(row.profiles);

  return {
    rank,
    user_id: row.user_id,
    username: profile?.username ?? "unknown",
    avatar_url: profile?.avatar_url ?? null,
    wins: row.wins,
    profit_pct: row.profit_pct,
    is_current_user: false,
  };
};

export const getLeaderboardPage = async (
  period: LeaderboardPeriod,
  page: number,
  limit: number
): Promise<{ data: LeaderboardItem[]; meta: LeaderboardMeta }> => {
  const { from, to } = getPaginationRange(page, limit);

  const { data, error, count } = await supabase
    .from("leaderboard_snapshots")
    .select("user_id,wins,profit_pct,profiles(username,avatar_url)", {
      count: "exact",
    })
    .eq("period", period)
    .order("profit_pct", { ascending: false })
    .order("wins", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data as LeaderboardRow[] | null) ?? [];
  const totalRecords = count ?? rows.length;

  return {
    data: rows.map((row, index) => mapRow(row, from + index + 1)),
    meta: {
      page,
      limit,
      has_next_page: (page + 1) * limit < totalRecords,
      total_records: totalRecords,
      total_pages: totalRecords > 0 ? Math.ceil(totalRecords / limit) : 0,
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
  wins: number;
  profit_pct: number;
} | null> => {
  const { data, error } = await supabase
    .from("leaderboard_snapshots")
    .select("wins,profit_pct,profiles(username,avatar_url)")
    .eq("period", period)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const { count: higherProfitCount, error: rankError } = await supabase
    .from("leaderboard_snapshots")
    .select("user_id", { count: "exact", head: true })
    .eq("period", period)
    .gt("profit_pct", data.profit_pct);

  if (rankError) {
    throw new Error(rankError.message);
  }

  const row = data as LeaderboardMeRow;
  const profile = getProfile(row.profiles);

  return {
    position: (higherProfitCount ?? 0) + 1,
    username: profile?.username ?? "unknown",
    avatar_url: profile?.avatar_url ?? null,
    wins: row.wins,
    profit_pct: row.profit_pct,
  };
};
