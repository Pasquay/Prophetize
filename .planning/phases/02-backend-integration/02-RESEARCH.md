# Phase 02: Backend Integration - Research

**Researched:** 2026-04-13
**Domain:** Express + Supabase backend contract integration for leaderboard/categories
**Confidence:** HIGH

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Implement `GET /markets/categories` as public endpoint returning JSON string array of uppercase category keys.
- Implement `GET /leaderboard` as public endpoint with required `period` query and optional `page`/`limit`.
- Implement `GET /leaderboard/me` as auth-required endpoint with same `period` validation.
- Keep response envelope for `GET /leaderboard` as `{ data: [...], meta: {...} }`.
- Keep `GET /leaderboard/me` response shape with `position`, `username`, `avatar_url`, `wins`, `profit_pct`.
- Return `400` for invalid `period` on both leaderboard endpoints.
- Return `400` for invalid pagination (`page < 0`, `limit <= 0`, `limit > 100`) on `GET /leaderboard`.
- Return `401` on missing/invalid token for `GET /leaderboard/me`.
- Return `404` when user has no ranking for requested period in `GET /leaderboard/me`.
- Keep `POST /auth/refresh-token` contract unchanged (`{ refresh_token }` in, `{ access_token }` out minimum).
- `GET /leaderboard` remains public; `is_current_user` defaults false unless optional auth parsing intentionally enabled.

### the agent's Discretion
- Exact persistence/query strategy for ranking computation (materialized view, aggregate query, or service-layer compose).
- Internal service/controller decomposition and type definitions.
- Caching strategy and invalidation approach if needed.
- Error payload structure details as long as frontend contract + status semantics are preserved.

### Deferred Ideas (OUT OF SCOPE)
- Optional auth parsing for public leaderboard to mark `is_current_user` true.
- Additional periods beyond `weekly` and `all_time`.
- Real-time leaderboard updates and push notifications.

## Project Constraints (from copilot-instructions.md)

- Apply GSD workflows only when explicitly invoked via `gsd-*` commands. [VERIFIED: .github/copilot-instructions.md]
- Treat `gsd-*` and `/gsd-*` as command invocations routed to matching skill docs. [VERIFIED: .github/copilot-instructions.md]
- Prefer matching custom agents in `.github/agents` when commands call for subagents. [VERIFIED: .github/copilot-instructions.md]
- After completing any `gsd-*` deliverable, always prompt user for the next step until user says they are done. [VERIFIED: .github/copilot-instructions.md]

## Summary

The codebase is already aligned to a route -> controller -> service backend shape and already ships a public categories endpoint (`GET /markets/categories`) returning uppercase keys from a typed constant. [VERIFIED: server/src/routes/marketRoutes.ts] [VERIFIED: server/src/controllers/marketController.ts] [VERIFIED: server/src/types/marketCategories.ts] The frontend leaderboard screen and API client are already implemented against the target contract (`GET /leaderboard`, `GET /leaderboard/me`, period + pagination, `data/meta` envelope), but backend leaderboard routes are not currently mounted or implemented. [VERIFIED: client/app/tabs/leaderboard.tsx] [VERIFIED: client/utils/api.ts] [VERIFIED: server/src/index.ts]

For Phase 2 planning, the highest-confidence strategy is to add a dedicated leaderboard module (`routes/leaderboardRoutes.ts`, `controllers/leaderboardController.ts`, `services/leaderboardService.ts`), mount it at `/leaderboard`, and reuse existing server patterns for auth middleware and Supabase query pagination. [VERIFIED: docs/backend_handoff_for_leaderboard_and_categories.md] [VERIFIED: server/src/middleware/authMiddleware.ts] [VERIFIED: server/src/utils/pagination.ts] Supabase data access should remain in services, with controllers responsible for strict query validation and status code semantics demanded by the handoff contract. [VERIFIED: docs/backend_handoff_for_leaderboard_and_categories.md] [VERIFIED: server/src/controllers/portfolioController.ts]

There is a planning mismatch in repository-level docs: `.planning/REQUIREMENTS.md` and `.planning/ROADMAP.md` currently describe profile-focused work rather than leaderboard/categories handoff. [VERIFIED: .planning/REQUIREMENTS.md] [VERIFIED: .planning/ROADMAP.md] Phase planning should therefore treat the handoff docs and 02-CONTEXT as canonical for this phase scope.

**Primary recommendation:** Implement leaderboard backend as a new modular route/controller/service unit, preserve current categories behavior, and enforce contract-first validation/status semantics exactly as documented.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| express | 5.2.1 | HTTP routing + middleware | Already used in server entrypoint and route registration; aligns with existing architecture. [VERIFIED: server/package.json] [VERIFIED: npm registry] |
| @supabase/supabase-js | 2.103.0 (latest), project currently ^2.97.0 | Database and auth access layer | Existing controllers/services already use Supabase query builder and auth APIs. [VERIFIED: server/package.json] [VERIFIED: server/src/config/supabaseClient.ts] [VERIFIED: npm registry] |
| typescript | 5.9.3 | Type-safe controllers/services | Server is strict TypeScript and should keep typed contract boundaries. [VERIFIED: server/package.json] [VERIFIED: server/tsconfig.json] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| dotenv | 17.3.1 | Load Supabase env vars | Required for local/server runtime before creating Supabase clients. [VERIFIED: server/package.json] [VERIFIED: server/src/config/supabaseClient.ts] |
| cors | 2.8.6 | Cross-origin access policy | Use when mobile/web clients call backend from different origins. [VERIFIED: server/package.json] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual SQL in controllers | Supabase RPC/view-backed service methods | Better separation and easier contract testing; needs SQL artifacts and migration ownership. [ASSUMED] |
| Single monolithic controller file | route/controller/service split | Existing code already uses split; lower regression risk and clearer responsibilities. [VERIFIED: server/src/routes] [VERIFIED: server/src/controllers] [VERIFIED: server/src/services] |

**Installation:**
```bash
cd server
npm install express @supabase/supabase-js
```

**Version verification:**
- `express` latest: `5.2.1`, npm `time.modified` = `2026-04-01T22:24:38.828Z`. [VERIFIED: npm registry]
- `@supabase/supabase-js` latest: `2.103.0`, npm `time.modified` = `2026-04-09T07:02:01.858Z`. [VERIFIED: npm registry]

## Architecture Patterns

### Recommended Project Structure
```text
server/src/
├── routes/
│   └── leaderboardRoutes.ts      # Endpoint mapping and middleware chaining
├── controllers/
│   └── leaderboardController.ts  # Query param validation + HTTP status contracts
├── services/
│   └── leaderboardService.ts     # Supabase data queries/aggregation + pagination meta
├── middleware/
│   └── authMiddleware.ts         # Existing Bearer token validation for /leaderboard/me
└── utils/
    └── pagination.ts             # Reuse getPaginationRange(page, limit)
```

### Pattern 1: Contract-First Controller Validation
**What:** Validate `period`, `page`, and `limit` at controller boundary before any DB call and return exact handoff status codes. [VERIFIED: docs/backend_handoff_for_leaderboard_and_categories.md]
**When to use:** Every leaderboard request handler (`GET /leaderboard`, `GET /leaderboard/me`).
**Example:**
```typescript
// Source: docs/backend_handoff_for_leaderboard_and_categories.md
const period = String(req.query.period ?? '');
if (period !== 'weekly' && period !== 'all_time') {
  return res.status(400).json({ error: 'Invalid period' });
}
```

### Pattern 2: Keep Public and Auth Routes Split
**What:** Use public controller for `GET /leaderboard` and guarded route with `requireAuth` for `GET /leaderboard/me`. [VERIFIED: docs/backend_handoff_for_leaderboard_and_categories.md] [VERIFIED: server/src/middleware/authMiddleware.ts]
**When to use:** Any endpoint where anonymous list access is allowed but user-specific overlay needs auth.
**Example:**
```typescript
// Source: server/src/routes pattern + handoff contract
router.get('/', controller.getLeaderboard);
router.get('/me', requireAuth, controller.getMyLeaderboardPosition);
```

### Pattern 3: Service-Layer Pagination Meta
**What:** Build deterministic `meta` object from validated `page/limit` and total count (`has_next_page`, `total_pages`). [VERIFIED: docs/backend_handoff_for_leaderboard_and_categories.md] [VERIFIED: client/utils/api.ts]
**When to use:** All paginated list endpoints consumed by FlatList infinite scroll.
**Example:**
```typescript
// Source: contract + existing pagination utility
const { from, to } = getPaginationRange(page, limit);
const totalPages = totalRecords ? Math.ceil(totalRecords / limit) : 0;
const hasNextPage = totalRecords ? ((page + 1) * limit) < totalRecords : false;
```

### Anti-Patterns to Avoid
- **Computing rank in client:** Rank ordering must be stable from server to avoid cross-page drift. [VERIFIED: docs/backend_handoff_for_leaderboard_and_categories.md]
- **Returning 200 with contract errors:** Invalid `period`/pagination must be `400`, unauthenticated `/me` must be `401`. [VERIFIED: docs/backend_handoff_for_leaderboard_and_categories.md]
- **Mixing data access into route files:** Existing repo conventions keep DB logic out of route files. [VERIFIED: server/src/routes] [VERIFIED: server/src/controllers] [VERIFIED: server/src/services]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auth token parsing | Custom JWT decode in leaderboard route | Existing `requireAuth` middleware | Keeps auth behavior/status codes consistent app-wide. [VERIFIED: server/src/middleware/authMiddleware.ts] |
| Supabase row pagination math | Ad-hoc offset math in each controller | Shared `getPaginationRange` utility | Avoids off-by-one pagination bugs and keeps 0-index behavior consistent. [VERIFIED: server/src/utils/pagination.ts] |
| Response contract normalization in client | Endpoint-specific frontend patching | Backend contract fidelity (`data/meta` and `/me` shape) | Frontend already depends on exact fields and query semantics. [VERIFIED: client/utils/api.ts] [VERIFIED: client/app/tabs/leaderboard.tsx] |

**Key insight:** This phase should optimize for strict contract fidelity over schema innovation, because client integration code is already production-shaped and failures will surface as pagination/auth regressions, not compile errors.

## Common Pitfalls

### Pitfall 1: Page Index Drift (0-index vs 1-index)
**What goes wrong:** Server treats `page` as 1-indexed while frontend sends 0-indexed values. [VERIFIED: docs/backend_handoff_for_leaderboard_and_categories.md] [VERIFIED: client/utils/api.ts]
**Why it happens:** Teams reuse generic pagination snippets not aligned to mobile contract.
**How to avoid:** Validate `page >= 0` and compute `from = page * limit` using shared utility.
**Warning signs:** Duplicate first page, skipped rows, or infinite-scroll loops.

### Pitfall 2: Public Endpoint Accidentally Requires Auth
**What goes wrong:** `GET /leaderboard` gets `requireAuth`, breaking anonymous leaderboard view. [VERIFIED: docs/backend_handoff_for_leaderboard_and_categories.md]
**Why it happens:** Route-level middleware copied from protected modules.
**How to avoid:** Keep `/` public and apply `requireAuth` only on `/me`.
**Warning signs:** Leaderboard tab fails for signed-out users.

### Pitfall 3: Missing Route Mount in Entry Server
**What goes wrong:** New route file exists but is never mounted in `index.ts`. [VERIFIED: server/src/index.ts]
**Why it happens:** No centralized route registry test.
**How to avoid:** Add `app.use('/leaderboard', leaderboardRoutes)` and smoke test with curl.
**Warning signs:** `404` on both leaderboard endpoints even after implementation.

### Pitfall 4: Contract Shape Mismatch
**What goes wrong:** Returning plain array for leaderboard list or wrong `/me` keys (e.g., `rank` instead of `position`). [VERIFIED: docs/backend_handoff_for_leaderboard_and_categories.md] [VERIFIED: client/utils/api.ts]
**Why it happens:** Reusing internal DTOs directly as API payloads.
**How to avoid:** Explicit response mappers in controller layer.
**Warning signs:** UI renders empty state while network call appears 200.

## Code Examples

Verified patterns from current project and official APIs:

### Leaderboard Routes Wiring
```typescript
// Source: server/src/index.ts + handoff doc route proposal
import leaderboardRoutes from './routes/leaderboardRoutes';
app.use('/leaderboard', leaderboardRoutes);
```

### Supabase Pagination Query
```typescript
// Source: server/src/controllers/marketController.ts + supabase-js docs
const { from, to } = getPaginationRange(page, limit);
const { data, error, count } = await supabase
  .from('leaderboard_snapshots')
  .select('user_id, rank, profit_pct, wins', { count: 'exact' })
  .eq('period', period)
  .order('rank', { ascending: true })
  .range(from, to);
```

### Auth-Guarded User-Specific Endpoint
```typescript
// Source: server/src/routes/userRoutes.ts + server/src/middleware/authMiddleware.ts
router.get('/me', requireAuth, controller.getMyLeaderboardPosition);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual `offset()` + `limit()` pagination calls | Unified `.range(from, to)` in supabase-js | v2 era | Cleaner and less error-prone pagination composition. [CITED: https://github.com/supabase/supabase-js/blob/v2.58.0/RELEASE.md] |
| Express async route wrappers (`tryCatch` helpers everywhere) | Express 5 catches rejected async handlers by default | Express 5 | Less boilerplate for async errors when handlers reject promises. [CITED: https://context7.com/expressjs/express/llms.txt] |

**Deprecated/outdated:**
- Assuming leaderboard backend is absent for categories endpoint is outdated; categories route already exists and returns enum keys. [VERIFIED: server/src/routes/marketRoutes.ts] [VERIFIED: server/src/controllers/marketController.ts]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | A dedicated ranking source (table/view/RPC) can be queried for both `weekly` and `all_time` efficiently without heavy runtime aggregation. [ASSUMED] | Architecture Patterns | Medium: may force schema/RPC work in Wave 0 |
| A2 | Existing profiles table contains all required display fields (`username`, `avatar_url`) for leaderboard joins. [ASSUMED] | Code Examples | Medium: contract fill may require fallback/null mapping |

## Open Questions (RESOLVED)

1. **What is the canonical data source for `weekly` and `all_time` rank?**
   - Decision: use `leaderboard_snapshots` as canonical source for both periods in this phase, with explicit service fallback to empty result when rows are missing.
   - Rationale: aligns with existing portfolio service touchpoint and avoids high-risk runtime transaction aggregation in this phase.
   - Status: RESOLVED.

2. **How is `weekly` bounded (timezone and reset schedule)?**
   - Decision: use UTC week window (`week_start_utc` to `week_end_utc`) for all weekly ranking reads in this phase.
   - Rationale: deterministic boundary prevents timezone-dependent rank drift.
   - Status: RESOLVED.

3. **Should unranked authenticated users on `/leaderboard/me` always return 404?**
   - Decision: yes, strict `404` for unranked authenticated users for this phase.
   - Rationale: matches handoff contract and current frontend expectation.
   - Status: RESOLVED.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Server runtime / TypeScript execution | Yes | v22.14.0 | None |
| npm/npx | Dependency install + scripts | Yes | 11.4.2 | None |
| pnpm | Optional package manager | Yes | 10.14.0 | Use npm |
| Python | Optional tooling scripts | Yes | 3.10.0 | None needed for this phase |
| Docker | Optional local service orchestration | Yes | 28.3.2 | Direct host execution |
| Supabase CLI | DB introspection/migrations | Yes (upgrade recommended) | 2.75.0 (latest noted 2.84.2) | Supabase dashboard/manual SQL |
| Supabase project env vars (`SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_KEY`) | Server boot + DB/auth access | Unknown in doc-only research | — | Block implementation until `.env` verified |

**Missing dependencies with no fallback:**
- None found at tooling level.

**Missing dependencies with fallback:**
- Supabase CLI is present but outdated; migration work can still proceed using current CLI or dashboard SQL editor.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None configured in server (manual/API smoke tests only currently) [VERIFIED: server/package.json] |
| Config file | none - add in Wave 0 |
| Quick run command | `cd server && npm test` (currently exits with error placeholder) [VERIFIED: server/package.json] |
| Full suite command | none - establish with chosen framework in Wave 0 |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BH-LB-01 | `GET /leaderboard` validates `period` and pagination bounds | integration | `cd server && npm test -- leaderboard.validation` | No - Wave 0 |
| BH-LB-02 | `GET /leaderboard` returns `{ data, meta }` with deterministic pagination fields | integration | `cd server && npm test -- leaderboard.pagination` | No - Wave 0 |
| BH-LB-03 | `GET /leaderboard/me` returns 401/400/404/200 semantics correctly | integration | `cd server && npm test -- leaderboard.me` | No - Wave 0 |
| BH-CAT-01 | `GET /markets/categories` returns uppercase key array | integration | `cd server && npm test -- markets.categories` | No - Wave 0 |
| BH-AUTH-01 | `POST /auth/refresh-token` request/response contract remains unchanged | integration | `cd server && npm test -- auth.refresh-token` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** targeted route/controller test command for changed endpoint.
- **Per wave merge:** full server API test suite once framework is established.
- **Phase gate:** all BH-* tests green plus manual curl smoke checks from handoff checklist.

### Wave 0 Gaps
- [ ] Add server test framework (recommended: Vitest + Supertest) and base config. [ASSUMED]
- [ ] Add `server/tests/leaderboard.contract.test.ts` for status and payload contract verification.
- [ ] Add `server/tests/markets.categories.test.ts` for categories response format and casing.
- [ ] Add `server/tests/auth.refresh.test.ts` to lock refresh-token compatibility.

## Security Domain

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Reuse Bearer token verification via `requireAuth` for `/leaderboard/me`. [VERIFIED: server/src/middleware/authMiddleware.ts] |
| V3 Session Management | yes | Preserve refresh-token endpoint contract and reject invalid/expired refresh tokens. [VERIFIED: server/src/controllers/userController.ts] |
| V4 Access Control | yes | Keep `/leaderboard` public and `/leaderboard/me` protected; avoid accidental middleware drift. [VERIFIED: docs/backend_handoff_for_leaderboard_and_categories.md] |
| V5 Input Validation | yes | Strict whitelist for `period` and numeric bounds for `page/limit` with 400 responses. [VERIFIED: docs/backend_handoff_for_leaderboard_and_categories.md] |
| V6 Cryptography | no (direct) | Defer to Supabase auth/JWT primitives; do not implement custom token cryptography. [VERIFIED: server/src/config/supabaseClient.ts] |

### Known Threat Patterns for Express + Supabase API
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Query parameter tampering (`period`, `page`, `limit`) | Tampering | Controller whitelist + numeric bound checks before query execution. |
| Unauthorized access to user-specific rank | Elevation of Privilege | `requireAuth` middleware and user id from verified token only. [VERIFIED: server/src/middleware/authMiddleware.ts] |
| Excessive pagination load (`limit` abuse) | Denial of Service | Enforce `limit <= 100` exactly per contract. [VERIFIED: docs/backend_handoff_for_leaderboard_and_categories.md] |
| Data disclosure through over-broad selects | Information Disclosure | Explicit select columns in service-layer Supabase queries; avoid `*` on joined profile data. [ASSUMED] |

## Sources

### Primary (HIGH confidence)
- Internal phase contract: docs/backend_handoff_for_leaderboard_and_categories.md (all endpoint and status-code constraints)
- Internal compatibility doc: docs/backend_handoff_requirements.md (explore/categories dependency context)
- Existing implementation files: server/src/index.ts, server/src/routes/marketRoutes.ts, server/src/controllers/marketController.ts, server/src/middleware/authMiddleware.ts, server/src/config/supabaseClient.ts, server/src/utils/pagination.ts, client/app/tabs/leaderboard.tsx, client/app/categories.tsx, client/utils/api.ts
- Context7 library docs: /expressjs/express/v5.2.0 (routing, middleware, async error handling)
- Context7 library docs: /supabase/supabase-js/v2.58.0 (query filtering, order, range pagination)
- npm registry checks: `npm view express version time.modified`, `npm view @supabase/supabase-js version time.modified`

### Secondary (MEDIUM confidence)
- None required beyond primary set.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - verified directly from project manifests and npm registry.
- Architecture: HIGH - aligned with existing route/controller/service structure and handoff contracts.
- Pitfalls: HIGH - derived from explicit contract constraints and current server wiring gaps.

**Research date:** 2026-04-13
**Valid until:** 2026-05-13