import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type MarketRow = {
  id: number;
  title: string;
  category: string;
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
  let statusEq: string | null = null;
  let statusIn: string[] | null = null;
  let lteEndDate: string | null = null;
  let updatePayload: Record<string, unknown> | null = null;
  let idEq: number | null = null;

  const self: Record<string, any> = {
    select: () => self,
    eq: (field: string, value: unknown) => {
      if (field === 'status') statusEq = String(value);
      if (field === 'id') idEq = Number(value);

      if (updatePayload && field === 'id') {
        state.markets = state.markets.map((market) =>
          market.id === Number(value) ? { ...market, ...(updatePayload as Partial<MarketRow>) } : market,
        );
      }

      return self;
    },
    in: (field: string, values: string[]) => {
      if (field === 'status') statusIn = values;
      return self;
    },
    lte: (field: string, value: string) => {
      if (field === 'end_date') lteEndDate = value;
      return self;
    },
    order: () => self,
    range: async () => {
      let data = [...state.markets];

      if (statusEq !== null) {
        data = data.filter((row) => row.status === statusEq);
      }

      if (statusIn !== null) {
        data = data.filter((row) => statusIn!.includes(row.status));
      }

      if (lteEndDate !== null) {
        data = data.filter((row) => new Date(row.end_date).getTime() <= new Date(lteEndDate!).getTime());
      }

      return { data, error: null };
    },
    update: (payload: Record<string, unknown>) => {
      updatePayload = payload;
      return self;
    },
    single: async () => {
      const found = state.markets.find((market) => (idEq === null ? false : market.id === idEq));
      if (!found) {
        return { data: null, error: { message: 'Market not found' } };
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

describe('Admin operations contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    hoisted.state.markets = [
      {
        id: 1,
        title: 'Will BTC hit 130k?',
        category: 'CRYPTO',
        status: 'pending',
        end_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Will Team A win finals?',
        category: 'SPORTS',
        status: 'active',
        end_date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
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

  it('requires admin role for pending approvals queue', async () => {
    const app = createTestApp();

    const response = await request(app)
      .get('/admin/markets/pending')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(403);
  });

  it('returns pending approvals queue for admin', async () => {
    const app = createTestApp();

    const response = await request(app)
      .get('/admin/markets/pending')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data[0].status).toBe('pending');
  });

  it('returns due-resolution queue for admin', async () => {
    const app = createTestApp();

    const response = await request(app)
      .get('/admin/markets/due-resolution')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.some((row: MarketRow) => row.status === 'active')).toBe(true);
  });

  it('enforces required resolution fields', async () => {
    const app = createTestApp();

    const response = await request(app)
      .post('/admin/markets/2/resolve')
      .set('Authorization', 'Bearer admin-token')
      .send({ resolved_option_id: 1 });

    expect(response.status).toBe(422);
    expect(response.body.error).toContain('resolution_evidence_url');
  });

  it('accepts full resolution payload and returns challenge window', async () => {
    const app = createTestApp();

    const response = await request(app)
      .post('/admin/markets/2/resolve')
      .set('Authorization', 'Bearer admin-token')
      .send({
        resolved_option_id: 1,
        resolution_evidence_url: 'https://evidence.example/test',
        resolution_note: 'Source verified by admin.',
      });

    expect(response.status).toBe(200);
    expect(response.body.resolution.challenge_window_ends_at).toBeTruthy();
  });
});
