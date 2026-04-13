import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

type MarketRow = {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  category: string;
  end_date: string;
  user_id: string;
  status: string;
  created_at: string;
  total_volume: number;
};

type MockState = {
  markets: MarketRow[];
  marketOptions: Array<Record<string, unknown>>;
  profiles: Record<string, { role: string }>;
  nextMarketId: number;
};

const hoisted = vi.hoisted(() => ({
  state: {
    markets: [],
    marketOptions: [],
    profiles: {},
    nextMarketId: 1,
  } as MockState,
  getUserMock: vi.fn(),
  fromMock: vi.fn(),
}));

vi.mock("../../src/config/supabaseClient", () => {
  return {
    supabase: {
      from: hoisted.fromMock,
      auth: {
        getUser: hoisted.getUserMock,
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

const createMarketsQuery = (state: MockState) => {
  let idFilter: number | null = null;
  let categoryFilter: string | null = null;
  let categoryAllow: string[] | null = null;
  let statusAllow: string[] | null = null;
  let updatePayload: Record<string, unknown> | null = null;

  const self: Record<string, any> = {
    select: () => self,
    order: () => self,
    range: async () => {
      let data = [...state.markets];
      if (idFilter !== null) data = data.filter((m) => m.id === idFilter);
      if (categoryFilter !== null) data = data.filter((m) => m.category === categoryFilter);
      if (categoryAllow !== null) data = data.filter((m) => categoryAllow!.includes(m.category));
      if (statusAllow !== null) data = data.filter((m) => statusAllow!.includes(m.status));

      const withOptions = data.map((market) => ({
        ...market,
        option: [],
        options: [],
      }));

      return { data: withOptions, error: null };
    },
    maybeSingle: async () => {
      let data = [...state.markets];
      if (idFilter !== null) data = data.filter((m) => m.id === idFilter);
      if (statusAllow !== null) data = data.filter((m) => statusAllow!.includes(m.status));

      const market = data[0];
      if (!market) {
        return { data: null, error: null };
      }

      return {
        data: {
          ...market,
          options: [],
        },
        error: null,
      };
    },
    eq: (field: string, value: unknown) => {
      if (field === "id") idFilter = Number(value);
      if (field === "category") categoryFilter = String(value);

      if (updatePayload && field === "id") {
        state.markets = state.markets.map((market) =>
          market.id === Number(value)
            ? { ...market, ...(updatePayload as Partial<MarketRow>) }
            : market,
        );
      }

      return self;
    },
    in: (field: string, values: string[]) => {
      if (field === "status") statusAllow = values;
      if (field === "category") categoryAllow = values;
      return self;
    },
    insert: (payload: Record<string, unknown>) => {
      const market: MarketRow = {
        id: state.nextMarketId++,
        title: String(payload.title ?? ""),
        description: String(payload.description ?? ""),
        image_url: payload.image_url ? String(payload.image_url) : null,
        category: String(payload.category ?? ""),
        end_date: String(payload.end_date ?? ""),
        user_id: String(payload.user_id ?? ""),
        status: String(payload.status ?? "pending"),
        created_at: new Date().toISOString(),
        total_volume: 0,
      };
      state.markets.push(market);

      return {
        select: () => ({
          single: async () => ({ data: market, error: null }),
        }),
      };
    },
    update: (payload: Record<string, unknown>) => {
      updatePayload = payload;
      return self;
    },
    single: async () => {
      const market = state.markets.find((m) => (idFilter === null ? true : m.id === idFilter));
      if (!market) {
        return { data: null, error: { message: "Market not found" } };
      }
      return { data: market, error: null };
    },
  };

  return self;
};

const createMarketOptionsQuery = (state: MockState) => ({
  insert: async (payload: Array<Record<string, unknown>>) => {
    state.marketOptions.push(...payload);
    return { error: null };
  },
});

const createProfilesQuery = (state: MockState) => {
  let idFilter: string | null = null;

  const self: Record<string, any> = {
    select: () => self,
    eq: (_field: string, value: unknown) => {
      idFilter = String(value);
      return self;
    },
    single: async () => {
      const profile = idFilter ? state.profiles[idFilter] : undefined;
      return { data: profile ?? null, error: profile ? null : { message: "Profile not found" } };
    },
  };

  return self;
};

describe("Market create contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    hoisted.state.markets = [];
    hoisted.state.marketOptions = [];
    hoisted.state.profiles = {
      "user-1": { role: "user" },
      "admin-1": { role: "admin" },
    };
    hoisted.state.nextMarketId = 1;

    hoisted.getUserMock.mockImplementation(async (token: string) => {
      if (token === "user-token") {
        return { data: { user: { id: "user-1" } }, error: null };
      }
      if (token === "admin-token") {
        return { data: { user: { id: "admin-1" } }, error: null };
      }
      return { data: { user: null }, error: { message: "Unauthorized" } };
    });

    hoisted.fromMock.mockImplementation((table: string) => {
      if (table === "markets") return createMarketsQuery(hoisted.state);
      if (table === "market_options") return createMarketOptionsQuery(hoisted.state);
      if (table === "profiles") return createProfilesQuery(hoisted.state);
      throw new Error(`Unexpected table: ${table}`);
    });
  });

  it("valid create payload returns pending market and keeps it hidden from public endpoints", async () => {
    const app = createTestApp();

    const createRes = await request(app)
      .post("/markets/create")
      .set("Authorization", "Bearer user-token")
      .send({
        title: "Will BTC hit 120k in 2026?",
        description: "Market submitted by user.",
        category: "CRYPTO",
        endDate: "2026-12-31T00:00:00.000Z",
        options: ["Yes", "No"],
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.message.toLowerCase()).toContain("pending");

    const marketId = createRes.body.marketId;

    const listRes = await request(app).get("/markets/get-all");
    expect(listRes.status).toBe(200);
    expect(listRes.body).toEqual([]);

    const detailRes = await request(app).get(`/markets/${marketId}`);
    expect(detailRes.status).toBe(404);
  });

  it("missing required fields return 400", async () => {
    const app = createTestApp();

    const basePayload = {
      title: "Title",
      description: "Description",
      category: "SPORTS",
      endDate: "2026-12-31T00:00:00.000Z",
      options: ["Yes", "No"],
    };

    const requiredFields: Array<"title" | "description" | "category" | "endDate"> = [
      "title",
      "description",
      "category",
      "endDate",
    ];

    for (const field of requiredFields) {
      const payload = { ...basePayload } as Record<string, unknown>;
      delete payload[field];

      const res = await request(app)
        .post("/markets/create")
        .set("Authorization", "Bearer user-token")
        .send(payload);

      expect(res.status).toBe(400);
    }
  });

  it("admin review approval transitions market to public visibility", async () => {
    const app = createTestApp();

    const createRes = await request(app)
      .post("/markets/create")
      .set("Authorization", "Bearer user-token")
      .send({
        title: "Will Team A win finals?",
        description: "Sports market",
        category: "SPORTS",
        endDate: "2026-11-01T00:00:00.000Z",
        options: ["Yes", "No"],
      });

    expect(createRes.status).toBe(201);

    const marketId = createRes.body.marketId;

    const approvalRes = await request(app)
      .post(`/markets/review/${marketId}`)
      .set("Authorization", "Bearer admin-token")
      .send({ action: "approve" });

    expect(approvalRes.status).toBe(200);
    expect(approvalRes.body.market.status).toBe("active");

    const listRes = await request(app).get("/markets/get-all");
    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].id).toBe(marketId);

    const detailRes = await request(app).get(`/markets/${marketId}`);
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.id).toBe(marketId);
    expect(detailRes.body.data.status).toBe("active");
  });
});
