import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type MarketRow = {
  id: number;
  status: string;
  end_date: string;
  resolved_at?: string;
  conflict_outcome?: string;
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
  let endDateLte: string | null = null;
  let resolvedAtGte: string | null = null;
  let conflictOutcomeEq: string | null = null;

  const self: Record<string, any> = {
    select: () => self,
    eq: (field: string, value: unknown) => {
      if (field === 'status') statusEq = String(value);
      if (field === 'conflict_outcome') conflictOutcomeEq = String(value);
      return self;
    },
    in: (field: string, values: string[]) => {
      if (field === 'status') statusIn = values;
      return self;
    },
    lte: (field: string, value: string) => {
      if (field === 'end_date') endDateLte = value;
      return self;
    },
    gte: (field: string, value: string) => {
      if (field === 'resolved_at') resolvedAtGte = value;
      return self;
    },
    range: async () => {
      let data = [...state.markets];

      if (statusEq !== null) data = data.filter((row) => row.status === statusEq);
      if (statusIn !== null) data = data.filter((row) => statusIn!.includes(row.status));
      if (endDateLte !== null) data = data.filter((row) => new Date(row.end_date).getTime() <= new Date(endDateLte!).getTime());
      if (resolvedAtGte !== null) {
        data = data.filter((row) => {
          if (!row.resolved_at) return false;
          return new Date(row.resolved_at).getTime() >= new Date(resolvedAtGte!).getTime();
        });
      }
      if (conflictOutcomeEq !== null) data = data.filter((row) => row.conflict_outcome === conflictOutcomeEq);

      return { data, count: data.length, error: null };
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

describe('Admin analytics contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    hoisted.state.markets = [
      { id: 1, status: 'pending', end_date: new Date().toISOString() },
      { id: 2, status: 'active', end_date: new Date(Date.now() - 60_000).toISOString() },
      { id: 3, status: 'finalized', end_date: new Date().toISOString(), resolved_at: new Date().toISOString(), conflict_outcome: 'uphold' },
      { id: 4, status: 'resolved', end_date: new Date().toISOString(), resolved_at: new Date().toISOString(), conflict_outcome: 'dismiss' },
      { id: 5, status: 'disputed', end_date: new Date().toISOString() },
    ];

    hoisted.state.profiles = {
      'admin-1': { role: 'admin' },
      'user-1': { role: 'user' },
    };

    hoisted.getUserMock.mockImplementation(async (token: string) => {
      if (token === 'admin-token') return { data: { user: { id: 'admin-1' } }, error: null };
      if (token === 'user-token') return { data: { user: { id: 'user-1' } }, error: null };
      return { data: { user: null }, error: { message: 'Unauthorized' } };
    });

    hoisted.fromMock.mockImplementation((table: string) => {
      if (table === 'markets') return createMarketsQuery(hoisted.state);
      if (table === 'profiles') return createProfilesQuery(hoisted.state);
      throw new Error(`Unexpected table: ${table}`);
    });
  });

  it('returns operations analytics for admin', async () => {
    const app = createTestApp();

    const response = await request(app)
      .get('/admin/analytics/operations')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(200);
    expect(typeof response.body.data.pending_count).toBe('number');
    expect(Array.isArray(response.body.data.throughput)).toBe(true);
  });

  it('returns conflict analytics for admin', async () => {
    const app = createTestApp();

    const response = await request(app)
      .get('/admin/analytics/conflicts')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(200);
    expect(typeof response.body.data.open_conflicts).toBe('number');
    expect(Array.isArray(response.body.data.outcomes)).toBe(true);
  });

  it('blocks non-admin analytics access', async () => {
    const app = createTestApp();

    const response = await request(app)
      .get('/admin/analytics/operations')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(403);
  });
});
