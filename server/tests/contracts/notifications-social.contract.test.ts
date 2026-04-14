import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUserMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
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

import { createTestApp } from "../setup";

describe("Notifications and social contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
  });

  it("POST /notifications/register enforces auth and validates payload", async () => {
    const app = createTestApp();

    const noAuth = await request(app).post("/notifications/register").send({
      deviceToken: "expo-push-token",
      platform: "ios",
    });
    expect(noAuth.status).toBe(401);

    const badPayload = await request(app)
      .post("/notifications/register")
      .set("Authorization", "Bearer token")
      .send({ deviceToken: "", platform: "desktop" });
    expect(badPayload.status).toBe(400);

    const ok = await request(app)
      .post("/notifications/register")
      .set("Authorization", "Bearer token")
      .send({ deviceToken: "expo-push-token", platform: "ios" });

    expect(ok.status).toBe(200);
    expect(ok.body).toMatchObject({
      message: "Notification channel registered",
      registration: {
        user_id: "user-1",
        device_token: "expo-push-token",
        platform: "ios",
      },
    });
  });

  it("POST /notifications/trigger validates payload and returns minimal signed target payload", async () => {
    const app = createTestApp();

    const invalidType = await request(app)
      .post("/notifications/trigger")
      .set("Authorization", "Bearer token")
      .send({ type: "admin", recipientUserId: "user-2" });
    expect(invalidType.status).toBe(400);

    const ok = await request(app)
      .post("/notifications/trigger")
      .set("Authorization", "Bearer token")
      .send({
        type: "market",
        recipientUserId: "user-2",
        title: "Market updated",
        body: "A market you follow moved.",
        marketId: 42,
      });

    expect(ok.status).toBe(202);
    expect(ok.body.notification).toMatchObject({
      type: "market",
      recipient_user_id: "user-2",
      title: "Market updated",
      body: "A market you follow moved.",
      target_path: "/marketDetails?id=42",
    });
    expect(typeof ok.body.notification.target_signature).toBe("string");
    expect(ok.body.notification.target_signature.length).toBeGreaterThan(8);

    const allowedKeys = [
      "body",
      "recipient_user_id",
      "target_path",
      "target_signature",
      "title",
      "type",
    ];
    expect(Object.keys(ok.body.notification).sort()).toEqual(allowedKeys);
  });

  it("POST /social/follow enforces auth and returns follow state envelope", async () => {
    const app = createTestApp();

    const noAuth = await request(app).post("/social/follow").send({
      targetUserId: "user-2",
    });
    expect(noAuth.status).toBe(401);

    const follow = await request(app)
      .post("/social/follow")
      .set("Authorization", "Bearer token")
      .send({ targetUserId: "user-2", action: "follow" });

    expect(follow.status).toBe(200);
    expect(follow.body).toEqual({
      relationship: {
        user_id: "user-1",
        target_user_id: "user-2",
        following: true,
      },
    });

    const unfollow = await request(app)
      .post("/social/follow")
      .set("Authorization", "Bearer token")
      .send({ targetUserId: "user-2", action: "unfollow" });

    expect(unfollow.status).toBe(200);
    expect(unfollow.body.relationship.following).toBe(false);
  });

  it("POST /social/comments and GET /social/comments/:marketId enforce validation and return comment shapes", async () => {
    const app = createTestApp();

    const noAuth = await request(app).post("/social/comments").send({
      marketId: 7,
      content: "hello",
    });
    expect(noAuth.status).toBe(401);

    const tooLong = await request(app)
      .post("/social/comments")
      .set("Authorization", "Bearer token")
      .send({ marketId: 7, content: "x".repeat(281) });
    expect(tooLong.status).toBe(400);

    const ok = await request(app)
      .post("/social/comments")
      .set("Authorization", "Bearer token")
      .send({ marketId: 7, content: " <b>Great market</b> " });

    expect(ok.status).toBe(201);
    expect(ok.body.comment).toMatchObject({
      market_id: 7,
      user_id: "user-1",
      content: "Great market",
    });

    const list = await request(app).get("/social/comments/7");
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.data)).toBe(true);
    expect(list.body.data[0]).toMatchObject({
      market_id: 7,
      user_id: "user-1",
      content: "Great market",
    });
  });
});
