import { supabase } from "../config/supabaseClient";
import { getPaginationRange } from "../utils/pagination";

export type LeaderboardPeriod = "weekly" | "all_time";

type LeaderboardRow = {
  rank: number;
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
  rank: number;
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

const mapRow = (row: LeaderboardRow): LeaderboardItem => {
  const profile = getProfile(row.profiles);

  return {
    rank: row.rank,
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
    .select("rank,user_id,wins,profit_pct,profiles(username,avatar_url)", {
      count: "exact",
    })
    .eq("period", period)
    .order("rank", { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data as LeaderboardRow[] | null) ?? [];
  const totalRecords = count ?? rows.length;

  return {
    data: rows.map(mapRow),
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
    .select("rank,wins,profit_pct,profiles(username,avatar_url)")
    .eq("period", period)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as LeaderboardMeRow;
  const profile = getProfile(row.profiles);

  return {
    position: row.rank,
    username: profile?.username ?? "unknown",
    avatar_url: profile?.avatar_url ?? null,
    wins: row.wins,
    profit_pct: row.profit_pct,
  };
};
