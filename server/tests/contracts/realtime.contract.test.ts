import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestApp } from "../setup";
import { initializeRealtimeEmitter, resetRealtimeEmitter } from "../../src/services/realtimeService";

type OptionRow = {
  id: number;
  market_id: number;
  current_price: number;
};

type MarketRow = {
  id: number;
  status: string;
};

type ProfileRow = {
  id: string;
  balance: number;
};

type PositionRow = {
  user_id: string;
  market_option_id: number;
  shares_owned: number;
};

type MockState = {
  options: OptionRow[];
  markets: MarketRow[];
  profiles: Record<string, ProfileRow>;
  positions: PositionRow[];
};

const hoisted = vi.hoisted(() => ({
  state: {
    options: [],
    markets: [],
    profiles: {},
    positions: [],
  } as MockState,
  getUserMock: vi.fn(),
  fromMock: vi.fn(),
  rpcMock: vi.fn(),
}));

vi.mock("../../src/config/supabaseClient", () => {
  return {
    supabase: {
      from: hoisted.fromMock,
      rpc: hoisted.rpcMock,
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

const createMarketOptionsQuery = (state: MockState) => {
  let optionIdFilter: number | null = null;

  const self: Record<string, any> = {
    select: () => self,
    eq: (field: string, value: unknown) => {
      if (field === "id") {
        optionIdFilter = Number(value);
      }
      return self;
    },
    single: async () => {
      const option = state.options.find((row) => row.id === optionIdFilter);
      if (!option) {
        return { data: null, error: { message: "Option not found" } };
      }
      return { data: option, error: null };
    },
  };

  return self;
};

const createMarketsQuery = (state: MockState) => {
  let marketIdFilter: number | null = null;

  const self: Record<string, any> = {
    select: () => self,
    eq: (field: string, value: unknown) => {
      if (field === "id") {
        marketIdFilter = Number(value);
      }
      return self;
    },
    single: async () => {
      const market = state.markets.find((row) => row.id === marketIdFilter);
      if (!market) {
        return { data: null, error: { message: "Market not found" } };
      }
      return { data: market, error: null };
    },
  };

  return self;
};

const createProfilesQuery = (state: MockState) => {
  let userIdFilter: string | null = null;

  const self: Record<string, any> = {
    select: () => self,
    eq: (field: string, value: unknown) => {
      if (field === "id") {
        userIdFilter = String(value);
      }
      return self;
    },
    single: async () => {
      const profile = userIdFilter ? state.profiles[userIdFilter] : null;
      if (!profile) {
        return { data: null, error: { message: "Profile not found" } };
      }
      return { data: profile, error: null };
    },
  };

  return self;
};

const createPositionsQuery = (state: MockState) => {
  let userIdFilter: string | null = null;
  let optionIdFilter: number | null = null;

  const self: Record<string, any> = {
    select: () => self,
    eq: (field: string, value: unknown) => {
      if (field === "user_id") {
        userIdFilter = String(value);
      }
      if (field === "market_option_id") {
        optionIdFilter = Number(value);
      }
      return self;
    },
    maybeSingle: async () => {
      const position = state.positions.find(
        (row) => row.user_id === userIdFilter && row.market_option_id === optionIdFilter,
      );
      return { data: position ?? null, error: null };
    },
  };

  return self;
};

describe("Realtime event contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRealtimeEmitter();

    hoisted.state.options = [{ id: 11, market_id: 101, current_price: 10 }];
    hoisted.state.markets = [{ id: 101, status: "active" }];
    hoisted.state.profiles = {
      "user-1": { id: "user-1", balance: 100 },
    };
    hoisted.state.positions = [];

    hoisted.getUserMock.mockImplementation(async (token: string) => {
      if (token === "valid-token") {
        return { data: { user: { id: "user-1" } }, error: null };
      }
      return { data: { user: null }, error: { message: "Unauthorized" } };
    });

    hoisted.fromMock.mockImplementation((table: string) => {
      if (table === "market_options") return createMarketOptionsQuery(hoisted.state);
      if (table === "markets") return createMarketsQuery(hoisted.state);
      if (table === "profiles") return createProfilesQuery(hoisted.state);
      if (table === "user_positions") return createPositionsQuery(hoisted.state);
      throw new Error(`Unexpected table: ${table}`);
    });

    hoisted.rpcMock.mockImplementation(async (fnName: string, args: Record<string, unknown>) => {
      if (fnName !== "handle_buy_shares") {
        return { data: null, error: { message: `Unexpected rpc: ${fnName}` } };
      }

      const userId = String(args.p_user_id);
      const optionId = Number(args.p_option_id);
      const shares = Number(args.p_shares);
      const totalCost = Number(args.p_total_cost);

      const profile = hoisted.state.profiles[userId];
      if (!profile) {
        return { data: null, error: { message: "Profile not found" } };
      }

      profile.balance -= totalCost;

      hoisted.state.positions.push({
        user_id: userId,
        market_option_id: optionId,
        shares_owned: shares,
      });

      return { data: null, error: null };
    });
  });

  it("emits market, portfolio, and leaderboard update events for successful trades", async () => {
    const emitted: Array<{ event: string; payload: unknown }> = [];

    initializeRealtimeEmitter((event, payload) => {
      emitted.push({ event, payload });
    });

    const app = createTestApp();
    const response = await request(app)
      .post("/transaction/buy")
      .set("Authorization", "Bearer valid-token")
      .send({ optionId: 11, shares: 2 });

    expect(response.status).toBe(200);
    expect(emitted.map((item) => item.event)).toEqual([
      "market.updated",
      "portfolio.updated",
      "leaderboard.updated",
    ]);

    expect(emitted[0]?.payload).toMatchObject({
      marketId: 101,
      optionId: 11,
    });

    expect(emitted[1]?.payload).toMatchObject({
      userId: "user-1",
      balance: 80,
      position: {
        optionId: 11,
        sharesOwned: 2,
      },
    });

    expect(emitted[2]?.payload).toMatchObject({
      userId: "user-1",
      marketId: 101,
    });
  });

  it("does not crash successful trades when no realtime subscriber is configured", async () => {
    const app = createTestApp();

    const response = await request(app)
      .post("/transaction/buy")
      .set("Authorization", "Bearer valid-token")
      .send({ optionId: 11, shares: 2 });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      message: "Purchase successful",
    });
  });
});
