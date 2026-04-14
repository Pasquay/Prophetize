import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { refreshSessionMock } = vi.hoisted(() => ({
  refreshSessionMock: vi.fn(),
}));

vi.mock("../../src/config/supabaseClient", () => {
  return {
    supabase: {
      auth: {
        getUser: vi.fn(),
        refreshSession: refreshSessionMock,
      },
      from: vi.fn(),
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

describe("POST /auth/refresh-token contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("preserves the refresh token payload and returns access_token", async () => {
    const app = createTestApp();

    refreshSessionMock.mockResolvedValueOnce({
      data: {
        session: {
          access_token: "new-access-token",
          refresh_token: "refresh-2",
        },
      },
      error: null,
    });

    const res = await request(app).post("/auth/refresh-token").send({
      refresh_token: "refresh-1",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("access_token", "new-access-token");
    expect(typeof res.body.access_token).toBe("string");
    expect(res.body).toHaveProperty("session");
    expect(res.body.session).toHaveProperty("access_token", "new-access-token");
    expect(refreshSessionMock).toHaveBeenCalledWith({ refresh_token: "refresh-1" });
  });

  it("returns 400 when refresh_token is missing", async () => {
    const app = createTestApp();

    const res = await request(app).post("/auth/refresh-token").send({});

    expect(res.status).toBe(400);
    expect(refreshSessionMock).not.toHaveBeenCalled();
  });

  it("rejects non-contract payload keys", async () => {
    const app = createTestApp();

    const res = await request(app).post("/auth/refresh-token").send({
      refreshToken: "refresh-1",
    });

    expect(res.status).toBe(400);
    expect(refreshSessionMock).not.toHaveBeenCalled();
  });
});
