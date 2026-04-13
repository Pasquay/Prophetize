import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUserMock, fixtures } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  fixtures: {
    users: [
      { id: "u1", username: "alice", avatar_url: null },
      { id: "u2", username: "bob", avatar_url: null },
      { id: "u3", username: "charlie", avatar_url: null },
    ],
    snapshots: [
      { user_id: "u1", period: "weekly", rank: 1, wins: 12, profit_pct: 14.5 },
      { user_id: "u2", period: "weekly", rank: 2, wins: 11, profit_pct: 8.2 },
      { user_id: "u3", period: "weekly", rank: 3, wins: 8, profit_pct: 3.1 },
      { user_id: "u1", period: "all_time", rank: 4, wins: 32, profit_pct: 25.7 },
    ],
  },
}));

type QueryState = {
  table: string;
  period?: string;
  userId?: string;
  from?: number;
  to?: number;
};

const evaluate = (state: QueryState, single: boolean) => {
  if (state.table !== "leaderboard_snapshots") {
    return Promise.resolve({ data: [], error: null, count: 0 });
  }

  let rows = fixtures.snapshots;

  if (state.period) {
    rows = rows.filter((item) => item.period === state.period);
  }

  if (state.userId) {
    rows = rows.filter((item) => item.user_id === state.userId);
  }

  rows = rows.sort((a, b) => a.rank - b.rank);

  const withProfiles = rows.map((row) => {
    const profile = fixtures.users.find((item) => item.id === row.user_id);

    return {
      ...row,
      profiles: profile
        ? {
            username: profile.username,
            avatar_url: profile.avatar_url,
          }
        : null,
    };
  });

  if (single) {
    return Promise.resolve({ data: withProfiles[0] ?? null, error: null });
  }

  const start = state.from ?? 0;
  const end = state.to ?? withProfiles.length - 1;

  return Promise.resolve({
    data: withProfiles.slice(start, end + 1),
    error: null,
    count: withProfiles.length,
  });
};

const createSupabaseQuery = (table: string) => {
  const state: QueryState = { table };

  const builder = {
    select: vi.fn().mockReturnValue(builder),
    eq: vi.fn((field: string, value: unknown) => {
      if (field === "period") {
        state.period = value as string;
      }
      if (field === "user_id") {
        state.userId = value as string;
      }
      return builder;
    }),
    order: vi.fn().mockReturnValue(builder),
    range: vi.fn((from: number, to: number) => {
      state.from = from;
      state.to = to;
      return evaluate(state, false);
    }),
    maybeSingle: vi.fn(() => evaluate(state, true)),
  };

  return builder;
};

vi.mock("../../src/config/supabaseClient", () => {
  return {
    supabase: {
      from: vi.fn((table: string) => createSupabaseQuery(table)),
      auth: {
        getUser: getUserMock,
        refreshSession: vi.fn(),
      },
    },
    supabaseAdmin: {
      from: vi.fn(),
      auth: {
        admin: {
          signOut: vi.fn(),
        },
      },
    },
  };
});

import { createTestApp } from "../setup";

describe("Leaderboard contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /leaderboard validates period/page/limit and returns the expected envelope", async () => {
    const app = createTestApp();

    const invalidPeriod = await request(app).get("/leaderboard").query({ period: "daily" });
    expect(invalidPeriod.status).toBe(400);

    const invalidPage = await request(app).get("/leaderboard").query({ period: "weekly", page: -1 });
    expect(invalidPage.status).toBe(400);

    const invalidLimit = await request(app).get("/leaderboard").query({ period: "weekly", limit: 101 });
    expect(invalidLimit.status).toBe(400);

    const valid = await request(app).get("/leaderboard").query({ period: "weekly", page: 0, limit: 2 });

    expect(valid.status).toBe(200);
    expect(valid.body).toHaveProperty("data");
    expect(valid.body).toHaveProperty("meta");
    expect(Array.isArray(valid.body.data)).toBe(true);

    const [first] = valid.body.data;
    expect(first).toMatchObject({
      rank: expect.any(Number),
      user_id: expect.any(String),
      username: expect.any(String),
      avatar_url: null,
      wins: expect.any(Number),
      profit_pct: expect.any(Number),
      is_current_user: false,
    });

    expect(valid.body.meta).toEqual({
      page: 0,
      limit: 2,
      has_next_page: true,
      total_records: 3,
      total_pages: 2,
    });
  });

  it("GET /leaderboard/me returns 401, 400, 404, and 200 as documented", async () => {
    const app = createTestApp();

    const noAuth = await request(app).get("/leaderboard/me").query({ period: "weekly" });
    expect(noAuth.status).toBe(401);

    getUserMock.mockResolvedValueOnce({
      data: { user: { id: "u1" } },
      error: null,
    });

    const invalidPeriod = await request(app)
      .get("/leaderboard/me")
      .set("Authorization", "Bearer token-valid")
      .query({ period: "daily" });
    expect(invalidPeriod.status).toBe(400);

    getUserMock.mockResolvedValueOnce({
      data: { user: { id: "u999" } },
      error: null,
    });

    const noRank = await request(app)
      .get("/leaderboard/me")
      .set("Authorization", "Bearer token-valid")
      .query({ period: "weekly" });
    expect(noRank.status).toBe(404);

    getUserMock.mockResolvedValueOnce({
      data: { user: { id: "u1" } },
      error: null,
    });

    const ok = await request(app)
      .get("/leaderboard/me")
      .set("Authorization", "Bearer token-valid")
      .query({ period: "weekly" });

    expect(ok.status).toBe(200);
    expect(ok.body).toEqual({
      position: 1,
      username: "alice",
      avatar_url: null,
      wins: 12,
      profit_pct: 14.5,
    });
  });
});
