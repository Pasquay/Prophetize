import request from "supertest";
import { describe, expect, it, vi } from "vitest";

const { getUserMock, refreshSessionMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  refreshSessionMock: vi.fn(),
}));

vi.mock("../../src/config/supabaseClient", () => {
  return {
    supabase: {
      auth: {
        getUser: getUserMock,
        refreshSession: refreshSessionMock,
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

describe("GET /markets/categories contract", () => {
  it("returns a JSON array of uppercase strings", async () => {
    const app = createTestApp();

    const res = await request(app).get("/markets/categories");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    for (const category of res.body) {
      expect(typeof category).toBe("string");
      expect(category).toBe(category.toUpperCase());
    }
  });
});
