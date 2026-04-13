# Roadmap

## Project: Prophetize
**Created**: 2026-03-21

## Overview
This roadmap outlines the development phases for the Prophetize prediction market app, starting with the immediate profile page enhancement and extending to future core features.

## Phase 1: Profile Enhancement
**Goal**: Polish the user profile screen to match the app’s design system and provide a comprehensive view of user stats, activity, and settings.

### Scope
- Implement FR‑1 through FR‑6 from REQUIREMENTS.md
- Ensure visual consistency with Explore and Leaderboard tabs
- Use mock data for stats and activity
- Pass all lint/type checks

### Success Criteria
✅ Profile header matches white‑header‑with‑border pattern  
✅ User identity section displays avatar, username, join date, net worth pill  
✅ Statistics grid shows win rate and total predictions  
✅ Recent activity list renders with proper outcome badges  
✅ Settings menu includes Notifications, Support, Security, Log Out  
✅ Zero TypeScript/lint errors  
✅ No regression in existing tabs

### Tasks
1. **Update profile.tsx** – apply white header, net worth pill, consistent spacing  
2. **Clean up imports** – remove unused `api`, `BalanceCard`, `authLoading`  
3. **Verify tokens** – ensure all colors come from `UI_COLORS`/`ExploreTheme`  
4. **Run validation** – lint, typecheck, and visual inspection

### Timeline
- **Estimate**: 1‑2 hours (mostly completed)
- **Status**: In progress (UI updated, lint warnings addressed)

### Dependencies
- Existing design tokens (`ui‑tokens.ts`, `explore‑theme.ts`)
- Profile subcomponents (`profile‑avatar`, `stat‑card`, `activity‑item`, `settings‑item`)

## Phase 2: Backend Integration
**Goal**: Deliver backend contracts required by current frontend integration priorities, starting with leaderboard and category endpoints.

### Scope
- Implement `GET /markets/categories` public endpoint returning category keys for Categories screen
- Implement `GET /leaderboard` public endpoint with period + pagination validation and `{ data, meta }` contract
- Implement `GET /leaderboard/me` auth-required endpoint for "Your Rank" card with 401/400/404 semantics
- Preserve `POST /auth/refresh-token` request/response compatibility while adding leaderboard/category routes
- Add contract verification tests and rollback runbook for safe deployment

### Success Criteria
- `GET /markets/categories` returns uppercase string array contract
- `GET /leaderboard` returns contract-compliant `data` + `meta` with valid pagination behavior
- `GET /leaderboard/me` returns required auth and ranking status semantics (401/400/404/200)
- Frontend leaderboard and categories screens can consume backend without mock fallback regressions
- Auth refresh flow remains unchanged and verified

### Timeline
- **Estimate**: 3‑5 days (backend + frontend work)
- **Status**: Not started

### Dependencies
- Supabase backend tables for users, predictions, markets
- Authentication context already in place

## Phase 3: Advanced Features
**Goal**: Implement core prediction‑market functionality beyond the profile page.

### Scope
- **Market creation** – allow users to create new prediction markets (admin approval required before public visibility/trading)
- **Trading interface** – buy/sell shares in markets
- **Real‑time updates** – live odds, balance, activity via WebSockets
- **Notifications** – push notifications for market resolution, price alerts
- **Social features** – following, leaderboard, comments

### Success Criteria
- Users can create a market with title, description, resolution date and see pending-approval status
- Users can trade shares with fake currency
- Real‑time updates work across tabs
- Notifications are delivered and actionable

### Timeline
- **Estimate**: 2‑4 weeks per major feature
- **Status**: Future

### Dependencies
- Backend market/trade models
- WebSocket infrastructure (Socket.io already in package.json)
- Push notification service (Expo Notifications)

**Plans:** 4 plans

Plans:
- [x] 03-01-PLAN.md — Market creation API + client flow baseline
- [ ] 03-02-PLAN.md — Trading contract hardening and UI integration
- [ ] 03-03-PLAN.md — Realtime socket events and reconnect sync
- [ ] 03-04-PLAN.md — Notifications + social baseline (follow/comments)

## Phase 4: Polish & Launch
**Goal**: Refine UI/UX, performance, accessibility, and prepare for app‑store submission.

### Scope
- **Performance audits** – reduce bundle size, optimize images, memoize components
- **Accessibility** – screen‑reader support, contrast ratios, focus management
- **Localization** – support multiple languages
- **App‑store readiness** – privacy policy, store listings, screenshots
- **Beta testing** – gather user feedback, fix critical issues

### Success Criteria
- App scores >90 on Lighthouse performance
- Passes React Native accessibility audit
- Supports at least English and Spanish
- Meets Google Play/Apple App Store guidelines

### Timeline
- **Estimate**: 2‑3 weeks
- **Status**: Future

## Notes
- Phase 1 is the immediate priority and aligns with the user’s request.
- Future phases may be reprioritized based on user feedback and business needs.
- All phases will follow GSD workflow with atomic commits and goal‑backward verification.
