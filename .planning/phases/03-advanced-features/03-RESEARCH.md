# Phase 03 Research - Advanced Features

**Date:** 2026-04-13
**Scope:** Market creation, trading UI/API, realtime updates, notifications, social baseline

## Findings

1. Current backend already has auth, markets, transactions, and portfolio foundations.
2. Client has market detail + leaderboard + auth context that can be extended without redesigning app shell.
3. Socket.io dependency exists in both client and server manifests but realtime flow is not fully wired.
4. Highest risk is trying to ship all five capability domains in one monolithic plan.

## Recommended Execution Shape

Split Phase 03 into vertical slices with explicit wave dependencies:

- Slice A: Market creation contracts and UI
- Slice B: Trading flow hardening and optimistic UI updates
- Slice C: Realtime event transport + client subscription
- Slice D: Notifications + social baseline endpoints/UI

This keeps each plan under context budget and allows earlier user-visible value.

## Architecture Guidance

### Market Creation
- Add dedicated create-market contract in route/controller with validation.
- Reuse category constants and existing market table shape.
- Return normalized market payload used by existing card/detail components.

### Trading
- Keep buy/sell logic in transaction controller/service boundary.
- Enforce server-side input validation for shares/price/market status.
- Return post-trade balance + position snapshot for immediate client state update.

### Realtime
- Emit socket events from server on trade and market update commit points.
- Add client reconnect + resync strategy to avoid stale UI.
- Keep events typed: `market.updated`, `portfolio.updated`, `leaderboard.updated`.

### Notifications
- Start with registration + triggered server events (resolution/price threshold).
- Keep trigger pipeline asynchronous and retry-safe.
- Define payload schema with route target (deep-link path).

### Social Baseline
- Add comment create/list and follow/unfollow primitives with auth.
- Keep moderation and rich reactions out of this phase.

## Security / Threat Notes

- Validate all create/trade/comment payloads at route entry.
- Keep auth required for mutation endpoints.
- Avoid exposing sensitive profile fields in social/leaderboard joins.
- Add rate limiting candidate for comment and trade endpoints.

## Open Questions (RESOLVED)

1. Deliver all advanced features at once?
- Decision: No. Deliver in four executable plans with explicit dependencies.

2. Realtime transport mechanism?
- Decision: Socket.io over existing dependency set.

3. Social scope depth?
- Decision: Baseline follow + comments only; advanced moderation deferred.

## Validation Architecture

- Framework: Vitest + Supertest (server) and targeted client integration checks.
- Per-plan checks: contract tests for each new endpoint and event channel.
- Wave gate: run all phase contract tests before verify-work.

## Requirement Mapping

- ADV-01 -> Plan 03-01
- ADV-02 -> Plan 03-02
- ADV-03 -> Plan 03-03
- ADV-04, ADV-05 -> Plan 03-04

## Risks

- Feature coupling across client screens can grow quickly; keep contracts explicit.
- Realtime + notifications introduce operational complexity; ship with fallback polling path.
- Social endpoints can inflate abuse surface; enforce auth + payload limits from day one.
