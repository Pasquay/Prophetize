import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUserMock, getLeaderboardPageMock, getMyLeaderboardPositionMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  getLeaderboardPageMock: vi.fn(),
  getMyLeaderboardPositionMock: vi.fn(),
}));

vi.mock("../../src/config/supabaseClient", () => {
  return {
    supabase: {
      from: vi.fn(),
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

vi.mock("../../src/services/leaderboardService", () => {
  return {
    getLeaderboardPage: getLeaderboardPageMock,
    getMyLeaderboardPosition: getMyLeaderboardPositionMock,
  };
});

import { createTestApp } from "../setup";

describe("Leaderboard contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getLeaderboardPageMock.mockResolvedValue({
      data: [
        {
          rank: 1,
          user_id: "u1",
          username: "alice",
          avatar_url: null,
          wins: 12,
          profit_pct: 14.5,
          is_current_user: false,
        },
        {
          rank: 2,
          user_id: "u2",
          username: "bob",
          avatar_url: null,
          wins: 11,
          profit_pct: 8.2,
          is_current_user: false,
        },
      ],
      meta: {
        page: 0,
        limit: 2,
        has_next_page: true,
        total_records: 3,
        total_pages: 2,
      },
    });

    getMyLeaderboardPositionMock.mockResolvedValue({
      position: 1,
      username: "alice",
      avatar_url: null,
      wins: 12,
      profit_pct: 14.5,
    });
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

    expect(getLeaderboardPageMock).toHaveBeenCalledWith("weekly", 0, 2);

    const allowedKeys = [
      "avatar_url",
      "is_current_user",
      "profit_pct",
      "rank",
      "user_id",
      "username",
      "wins",
    ];
    for (const row of valid.body.data) {
      expect(Object.keys(row).sort()).toEqual(allowedKeys);
      expect((row as Record<string, unknown>).email).toBeUndefined();
      expect((row as Record<string, unknown>).token).toBeUndefined();
    }

    const tamperedPeriod = await request(app)
      .get("/leaderboard")
      .query({ period: "all_time;drop_table=true", page: 0, limit: 10 });
    expect(tamperedPeriod.status).toBe(400);

    const boundary = await request(app)
      .get("/leaderboard")
      .query({ period: "weekly", page: 9999, limit: 100 });
    expect(boundary.status).toBe(200);
    expect(getLeaderboardPageMock).toHaveBeenCalledWith("weekly", 9999, 100);
  });

  it("GET /leaderboard/me returns 401, 400, 404, and 200 as documented", async () => {
    const app = createTestApp();

    const noAuth = await request(app).get("/leaderboard/me").query({ period: "weekly" });
    expect(noAuth.status).toBe(401);

    const malformedAuth = await request(app)
      .get("/leaderboard/me")
      .set("Authorization", "Bearer")
      .query({ period: "weekly" });
    expect(malformedAuth.status).toBe(401);

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
    getMyLeaderboardPositionMock.mockResolvedValueOnce(null);

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
