# Phase 2: Backend Integration - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning
**Source:** PRD Express Path (docs/backend_handoff_for_leaderboard_and_categories.md)

<domain>
## Phase Boundary

Deliver backend support required by current frontend categories and leaderboard flows.
Scope for this planning run is leaderboard + categories contracts from the handoff doc, while Phase 2 roadmap remains backend integration umbrella.

In-scope outcomes:
- Public categories endpoint with stable string-array contract.
- Public leaderboard endpoint with validated pagination/filter params.
- Auth-required "my rank" endpoint for signed-in user card.
- Contract-safe behavior aligned with current frontend API client and screens.

Out-of-scope for this run:
- Broad profile backend integration from older roadmap language unless needed for shared infrastructure.
- New product features outside categories/leaderboard backend handoff.

</domain>

<decisions>
## Implementation Decisions

### API Contracts (Locked)
- Implement `GET /markets/categories` as public endpoint returning JSON string array of uppercase category keys.
- Implement `GET /leaderboard` as public endpoint with required `period` query and optional `page`/`limit`.
- Implement `GET /leaderboard/me` as auth-required endpoint with same `period` validation.
- Keep response envelope for `GET /leaderboard` as `{ data: [...], meta: {...} }`.
- Keep `GET /leaderboard/me` response shape with `position`, `username`, `avatar_url`, `wins`, `profit_pct`.

### Validation and Status Codes (Locked)
- Return `400` for invalid `period` on both leaderboard endpoints.
- Return `400` for invalid pagination (`page < 0`, `limit <= 0`, `limit > 100`) on `GET /leaderboard`.
- Return `401` on missing/invalid token for `GET /leaderboard/me`.
- Return `404` when user has no ranking for requested period in `GET /leaderboard/me`.

### Auth/Compatibility (Locked)
- Keep `POST /auth/refresh-token` contract unchanged (`{ refresh_token }` in, `{ access_token }` out minimum).
- `GET /leaderboard` remains public; `is_current_user` defaults false unless optional auth parsing intentionally enabled.

### the agent's Discretion
- Exact persistence/query strategy for ranking computation (materialized view, aggregate query, or service-layer compose).
- Internal service/controller decomposition and type definitions.
- Caching strategy and invalidation approach if needed.
- Error payload structure details as long as frontend contract + status semantics are preserved.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and phase planning
- `.planning/ROADMAP.md` - Phase 2 scope baseline and dependency context.
- `.planning/REQUIREMENTS.md` - Existing project requirement style/quality baseline.

### Backend handoff contracts
- `docs/backend_handoff_for_leaderboard_and_categories.md` - Source-of-truth API contracts for this effort.
- `docs/backend_handoff_requirements.md` - Supplemental handoff requirements and constraints.
- `docs/leaderboards_execution_plan.md` - Existing execution sequencing context.

### Frontend integration points
- `client/app/categories.tsx` - Consumer of `/markets/categories`.
- `client/app/tabs/leaderboard.tsx` - Consumer of leaderboard endpoints.
- `client/utils/api.ts` - HTTP client helpers and expected response handling.

### Backend implementation points
- `server/src/index.ts` - Route registration and middleware wiring.
- `server/src/routes/` - Route modules for leaderboard/market endpoints.
- `server/src/controllers/` - HTTP contract handling layer.
- `server/src/services/` - Business logic and data assembly layer.

</canonical_refs>

<specifics>
## Specific Ideas

- Add `server/src/routes/leaderboardRoutes.ts` and wire under `/leaderboard`.
- Add `server/src/controllers/leaderboardController.ts` for request validation and response shaping.
- Add `server/src/services/leaderboardService.ts` for ranking/category retrieval logic.
- Add market categories route handler in `server/src/routes/marketRoutes.ts` under `GET /categories`.
- Enforce 0-indexed paging behavior exactly as frontend assumes.
- Include deterministic `meta` fields: `page`, `limit`, `has_next_page`, `total_records`, `total_pages`.

</specifics>

<deferred>
## Deferred Ideas

- Optional auth parsing for public leaderboard to mark `is_current_user` true.
- Additional periods beyond `weekly` and `all_time`.
- Real-time leaderboard updates and push notifications.

</deferred>

---

*Phase: 02-backend-integration*
*Context gathered: 2026-04-13 via PRD Express Path*
