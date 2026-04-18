import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type MarketRow = {
  id: number;
  title: string;
  status: string;
  end_date: string;
  created_at: string;
};

type MockState = {
  markets: MarketRow[];
  profiles: Record<string, { role: string }>;
};

const hoisted = vi.hoisted(() => ({
  state: {
    markets: [],
    profiles: {},
  } as MockState,
  getUserMock: vi.fn(),
  fromMock: vi.fn(),
}));

vi.mock('../../src/config/supabaseClient', () => {
  return {
    supabase: {
      from: hoisted.fromMock,
      auth: {
        getUser: hoisted.getUserMock,
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

import { createTestApp } from '../setup';

const createMarketsQuery = (state: MockState) => {
  let statusIn: string[] | null = null;
  let idEq: number | null = null;
  let updatePayload: Record<string, unknown> | null = null;

  const self: Record<string, any> = {
    select: () => self,
    in: (field: string, values: string[]) => {
      if (field === 'status') {
        statusIn = values;
      }
      return self;
    },
    order: () => self,
    range: async () => {
      let data = [...state.markets];
      if (statusIn !== null) {
        data = data.filter((row) => statusIn!.includes(row.status));
      }

      return { data, error: null };
    },
    update: (payload: Record<string, unknown>) => {
      updatePayload = payload;
      return self;
    },
    eq: (field: string, value: unknown) => {
      if (field === 'id') {
        idEq = Number(value);
      }

      if (updatePayload && field === 'id') {
        state.markets = state.markets.map((market) =>
          market.id === Number(value) ? { ...market, ...(updatePayload as Partial<MarketRow>) } : market,
        );
      }

      return self;
    },
    single: async () => {
      const found = state.markets.find((market) => market.id === idEq);
      if (!found) {
        return { data: null, error: { message: 'Conflict not found' } };
      }

      return { data: found, error: null };
    },
  };

  return self;
};

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
      return { data: profile ?? null, error: profile ? null : { message: 'Profile not found' } };
    },
  };

  return self;
};

describe('Admin conflict contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    hoisted.state.markets = [
      {
        id: 10,
        title: 'Conflict market example',
        status: 'disputed',
        end_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 11,
        title: 'Active market',
        status: 'active',
        end_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ];

    hoisted.state.profiles = {
      'admin-1': { role: 'admin' },
      'user-1': { role: 'user' },
    };

    hoisted.getUserMock.mockImplementation(async (token: string) => {
      if (token === 'admin-token') {
        return { data: { user: { id: 'admin-1' } }, error: null };
      }
      if (token === 'user-token') {
        return { data: { user: { id: 'user-1' } }, error: null };
      }
      return { data: { user: null }, error: { message: 'Unauthorized' } };
    });

    hoisted.fromMock.mockImplementation((table: string) => {
      if (table === 'markets') return createMarketsQuery(hoisted.state);
      if (table === 'profiles') return createProfilesQuery(hoisted.state);
      throw new Error(`Unexpected table: ${table}`);
    });
  });

  it('returns conflicts queue for admin', async () => {
    const app = createTestApp();

    const response = await request(app)
      .get('/admin/conflicts')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].status).toBe('disputed');
  });

  it('blocks non-admin conflict queue access', async () => {
    const app = createTestApp();

    const response = await request(app)
      .get('/admin/conflicts')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(403);
  });

  it('requires outcome_note in conflict resolution', async () => {
    const app = createTestApp();

    const response = await request(app)
      .post('/admin/conflicts/10/outcome')
      .set('Authorization', 'Bearer admin-token')
      .send({ outcome: 'uphold' });

    expect(response.status).toBe(422);
  });

  it('records conflict outcome and returns audit action payload', async () => {
    const app = createTestApp();

    const response = await request(app)
      .post('/admin/conflicts/10/outcome')
      .set('Authorization', 'Bearer admin-token')
      .send({ outcome: 'dismiss', outcome_note: 'False report', evidence_url: 'https://source.example/item' });

    expect(response.status).toBe(200);
    expect(response.body.action_history.action).toBe('record_conflict_outcome');
    expect(response.body.outcome.outcome).toBe('dismiss');
  });
});
