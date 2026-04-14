import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

import { createTestApp } from "../setup";

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

describe("Trading contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();

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
      const userId = String(args.p_user_id);
      const optionId = Number(args.p_option_id);
      const shares = Number(args.p_shares);
      const profile = hoisted.state.profiles[userId];

      if (!profile) {
        return { data: null, error: { message: "Profile not found" } };
      }

      const position = hoisted.state.positions.find(
        (row) => row.user_id === userId && row.market_option_id === optionId,
      );

      if (fnName === "handle_buy_shares") {
        const totalCost = Number(args.p_total_cost);
        if (profile.balance < totalCost) {
          return { data: null, error: { message: "Insufficient balance" } };
        }

        profile.balance -= totalCost;

        if (position) {
          position.shares_owned += shares;
        } else {
          hoisted.state.positions.push({
            user_id: userId,
            market_option_id: optionId,
            shares_owned: shares,
          });
        }

        return { data: null, error: null };
      }

      if (fnName === "handle_sell_shares") {
        const totalReturn = Number(args.p_total_return);
        if (!position || position.shares_owned < shares) {
          return { data: null, error: { message: "Not enough shares" } };
        }

        position.shares_owned -= shares;
        profile.balance += totalReturn;
        return { data: null, error: null };
      }

      return { data: null, error: { message: `Unexpected rpc: ${fnName}` } };
    });
  });

  it("invalid shares, invalid option price, and invalid market status return 4xx", async () => {
    const app = createTestApp();

    const invalidShares = await request(app)
      .post("/transaction/buy")
      .set("Authorization", "Bearer valid-token")
      .send({ optionId: 11, shares: 0 });
    expect(invalidShares.status).toBe(400);

    hoisted.state.options[0].current_price = 0;
    const invalidPrice = await request(app)
      .post("/transaction/buy")
      .set("Authorization", "Bearer valid-token")
      .send({ optionId: 11, shares: 2 });
    expect(invalidPrice.status).toBe(400);

    hoisted.state.options[0].current_price = 10;
    hoisted.state.markets[0].status = "pending";
    const invalidMarketStatus = await request(app)
      .post("/transaction/buy")
      .set("Authorization", "Bearer valid-token")
      .send({ optionId: 11, shares: 2 });
    expect(invalidMarketStatus.status).toBe(409);
  });

  it("valid buy and sell return updated balance and position snapshot", async () => {
    const app = createTestApp();

    const buyRes = await request(app)
      .post("/transaction/buy")
      .set("Authorization", "Bearer valid-token")
      .send({ optionId: 11, shares: 2 });

    expect(buyRes.status).toBe(200);
    expect(buyRes.body).toMatchObject({
      message: "Purchase successful",
      trade: {
        side: "buy",
        optionId: 11,
        shares: 2,
        totalCost: 20,
      },
      snapshot: {
        balance: 80,
        position: {
          optionId: 11,
          sharesOwned: 2,
        },
      },
    });

    const sellRes = await request(app)
      .post("/transaction/sell")
      .set("Authorization", "Bearer valid-token")
      .send({ optionId: 11, shares: 1 });

    expect(sellRes.status).toBe(200);
    expect(sellRes.body).toMatchObject({
      message: "Sale successful",
      trade: {
        side: "sell",
        optionId: 11,
        shares: 1,
        totalReturn: 10,
      },
      snapshot: {
        balance: 90,
        position: {
          optionId: 11,
          sharesOwned: 1,
        },
      },
    });
  });
});