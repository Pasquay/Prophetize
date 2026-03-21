# Codebase Concerns

**Analysis Date:** 2025-03-21

## Tech Debt

**Duplicate Market Option Processing Logic:**
- Issue: Same logic for sorting options, selecting top 2, and aggregating "other" appears in 4 controller functions (`getAllMarkets`, `getTrendingMarkets`, `getMarketByCategory`, `searchMarket`).
- Files: `server/src/controllers/marketController.ts` (lines 36‑63, 98‑127, 165‑193, 270‑297)
- Impact: Changes to option formatting require updates in multiple places; increases bug risk and maintenance cost.
- Fix approach: Extract shared logic into a helper function (e.g., `formatMarketOptions(rawOptions)`).

**Debug Logs in Production Code:**
- Issue: Console.log statements left in `reviewMarket` controller.
- Files: `server/src/controllers/marketController.ts` (lines 373‑374)
- Impact: Unnecessary noise in server logs; potential exposure of sensitive request data.
- Fix approach: Remove or replace with structured logging.

**Empty/Placeholder Files:**
- Issue: Zero‑line file `server/src/services/whereDBInteractionsAre.ts` serves no purpose.
- Files: `server/src/services/whereDBInteractionsAre.ts`
- Impact: Confusion about intended functionality; clutter in source tree.
- Fix approach: Delete file or implement actual DB interaction utilities.

**Hard‑coded Backend URL:**
- Issue: Default fallback URL is a specific local IP (`http://169.254.83.107:3001`) that may not be reachable in other environments.
- Files: `client/constants/backendUrl.ts` (line 1)
- Impact: App fails to connect to backend if environment variable `EXPO_PUBLIC_BACKEND_URL` is missing and the IP is incorrect.
- Fix approach: Require the environment variable, or provide a clear error when missing.

**Typo in Admin Middleware:**
- Issue: Error message contains "Admind only." (missing "i").
- Files: `server/src/middleware/adminMiddleware.ts` (line 16)
- Impact: Minor professionalism issue; does not affect functionality.
- Fix approach: Correct spelling to "Admin only."

**Large Controller File:**
- Issue: `marketController.ts` is 402 lines, mixing multiple responsibilities (fetching, formatting, searching).
- Files: `server/src/controllers/marketController.ts`
- Impact: Harder to navigate and test; high cognitive load.
- Fix approach: Split into separate controllers (e.g., `marketListController`, `marketSearchController`) or extract service modules.

## Code Quality & Consistency

**Missing Linting/Formatting Configuration:**
- Issue: Server directory lacks ESLint and Prettier configuration; client has basic Expo ESLint config.
- Files: `server/` (no .eslintrc, .prettierrc)
- Impact: Inconsistent code style between client and server; potential style drift.
- Fix approach: Extend client's ESLint config to server or create a shared configuration.

## Known Bugs

**Missing Backend Endpoints for Profile Data:**
- Symptoms: Profile screen displays mock stats and activity; real user data never loads.
- Files: `client/app/tabs/profile.tsx` (lines 49‑59, 67‑100)
- Trigger: User navigates to Profile tab; API calls are commented out.
- Workaround: None; data is static.

**Potential SQL Injection in Search Filter:**
- Symptoms: Currently uses Supabase's `.or()` with string interpolation; risk depends on Supabase's internal sanitization.
- Files: `server/src/controllers/marketController.ts` (line 257)
- Trigger: Search query containing malicious SQL fragments (unlikely but possible).
- Workaround: Use Supabase's parameterized filters (e.g., `.or('title.ilike.%${search}%', 'description.ilike.%${search}%')` if supported).

## Security Considerations

**Authentication & Authorization:**
- Risk: Admin middleware fetches user role on every request; no caching of role.
- Files: `server/src/middleware/adminMiddleware.ts`
- Current mitigation: Supabase query each time; role check is performed.
- Recommendations: Consider caching role in JWT claim or short‑lived session to reduce DB load.

**Environment Configuration:**
- Risk: Backend secrets (SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY) loaded from `.env` file; `.env` files present in both `client/` and `server/` directories.
- Files: `client/.env`, `server/.env`
- Current mitigation: Git ignores `.env` files; secrets not committed.
- Recommendations: Ensure `.env` files are never committed; use a secrets manager in production.

## Performance Bottlenecks

**Multiple Queries for Portfolio Summary:**
- Problem: `getPortfolioSummary` performs three separate Supabase queries (profile, positions, wins) that could be combined.
- Files: `server/src/services/portfolioService.ts` (lines 63‑131)
- Cause: Sequential queries increase latency.
- Improvement path: Use a single query with joins or a database view to fetch all needed data.

**Client‑Side Filtering of Positions:**
- Problem: `getPositions` fetches all user positions then filters by status in JavaScript.
- Files: `server/src/services/portfolioService.ts` (lines 180‑274)
- Cause: Extra data transferred and processed unnecessarily.
- Improvement path: Push status filter into the Supabase query using `.in('status', ...)`.

## Fragile Areas

**Error Handling in API Client:**
- Files: `client/utils/api.ts`
- Why fragile: Network errors are not caught by `handleResponse`; callers must implement their own try‑catch. Some endpoints only log errors to console without user feedback.
- Safe modification: Wrap fetch calls in a generic error handler that shows user‑friendly alerts.
- Test coverage: None.

**Missing Input Validation:**
- Files: `server/src/controllers/marketController.ts` (`createMarket`), `server/src/controllers/userController.ts`
- Why fragile: Request body fields assumed to exist and be of correct type; missing validation can lead to database errors or corrupted data.
- Safe modification: Add validation middleware (e.g., using `express‑validator`) for all public endpoints.
- Test coverage: None.

**Missing Error Boundaries in React Native:**
- Files: `client/app/**/*.tsx`, `client/components/**/*.tsx`
- Why fragile: Uncaught JavaScript errors will crash the entire app; no graceful fallback UI.
- Safe modification: Wrap screen components with error boundaries using `react‑error‑boundary` or custom solution.
- Test coverage: None.

## Scaling Limits

**Real‑Time Updates:**
- Current capacity: Socket.io client installed but no server‑side implementation found.
- Limit: Real‑time features (live prices, portfolio updates) not functional.
- Scaling path: Implement Socket.io server in `server/src/index.ts` and integrate with market price updates.

**Database Query Patterns:**
- Current capacity: Supabase queries use joins and ranges; performance untested under high load.
- Limit: Pagination uses `range(from, to)` which may become slow on large offsets.
- Scaling path: Use cursor‑based pagination with indexed columns.

## Dependencies at Risk

**Expo and React Native Versions:**
- Risk: Expo 54 and React Native 0.81.5 are relatively recent but may contain undiscovered issues.
- Impact: Potential compatibility problems with third‑party libraries.
- Migration plan: Keep dependencies updated via `expo upgrade` and test after each update.

## Missing Critical Features

**Automated Testing:**
- Problem: No unit, integration, or end‑to‑end test files found.
- Blocks: Confidence in refactoring, regression detection, and CI/CD pipeline.
- Priority: High.

**Admin Dashboard:**
- Problem: Admin endpoints exist (e.g., market review) but no dedicated UI.
- Blocks: Admins cannot approve/reject markets via frontend.
- Priority: Medium.

**Market Resolution Automation:**
- Problem: Markets can reach `end_date` but no automated job to transition them to `resolving` or `resolved` status.
- Blocks: Manual intervention required to finalize markets.
- Priority: Medium.

## Test Coverage Gaps

**Backend Controllers & Services:**
- What's not tested: All Supabase interactions, error paths, pagination, authentication, and authorization logic.
- Files: `server/src/controllers/*.ts`, `server/src/services/*.ts`
- Risk: Bugs in core market, portfolio, and user functionality could go unnoticed.
- Priority: High.

**Frontend Components & Hooks:**
- What's not tested: UI components, API hooks, state management (Zustand), navigation.
- Files: `client/app/**/*.tsx`, `client/components/**/*.tsx`, `client/context/*.ts`
- Risk: Visual regressions and interaction bugs may reach users.
- Priority: Medium.

---

*Concerns audit: 2025-03-21*