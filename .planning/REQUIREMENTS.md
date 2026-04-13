# Requirements

## Project: Prophetize
**Created**: 2026-03-21

## Overview
Enhance the user profile page to match the visual theme of other screens (white header with border, consistent use of UI tokens) and provide a comprehensive view of user stats, activity, and settings.

## Functional Requirements

### FR‑1: Profile Header
- **ID**: FR‑1
- **Description**: Profile screen must have a white header with a bottom border matching the Explore and Leaderboard tabs.
- **Acceptance Criteria**:
  - Header background is white (`#FFFFFF`)
  - Header has a 1px bottom border using `ExploreTheme.headerBorder` (`UI_COLORS.borderMuted`)
  - Contains a "Profile" title left‑aligned
  - Contains an "Edit" button right‑aligned (non‑functional placeholder)

### FR‑2: User Identity Section
- **ID**: FR‑2
- **Description**: Display user avatar, username, join date, and net worth.
- **Acceptance Criteria**:
  - Avatar is centered, using the existing `ProfileAvatar` component
  - Username displayed in `font‑grotesk‑bold`, size `text‑xl`
  - Join date formatted as "Joined Jan 2023"
  - Net worth shown as a pill with accent background and border
  - Net worth value formatted as `$X,XXX.XX` using `userData.balance`

### FR‑3: Statistics Grid
- **ID**: FR‑3
- **Description**: Show win rate and total predictions in a two‑column grid.
- **Acceptance Criteria**:
  - Uses `StatCard` component with consistent styling
  - Win rate displayed as percentage with trend indicator (up/down)
  - Total predictions displayed as integer with "All time" subtitle
  - Cards have equal width and proper spacing (`gap‑3`)

### FR‑4: Recent Activity
- **ID**: FR‑4
- **Description**: List recent prediction/market activities with outcome badges.
- **Acceptance Criteria**:
  - Section title "Recent Activity" with "View All" link (placeholder)
  - Activity items show icon, title, result (won/lost/pending), amount, ROI, date
  - Uses `ActivityItem` component with proper borders between items
  - Empty state shows `EmptyState` component with "No activity yet"

### FR‑5: Settings Menu
- **ID**: FR‑5
- **Description**: Provide settings options and logout button.
- **Acceptance Criteria**:
  - Section title "Settings"
  - Menu items: Notifications, Support, Security, Log Out
  - Each item uses `SettingsItem` component with appropriate icons
  - Log Out item is destructive (red text) and triggers confirmation dialog
  - All items except Log Out show chevron right

### FR‑6: Visual Consistency
- **ID**: FR‑6
- **Description**: Entire profile screen must adhere to the app’s design system.
- **Acceptance Criteria**:
  - Uses only `UI_COLORS` and `ExploreTheme` tokens
  - Follows spacing conventions (`px‑5`, `py‑6`, `mb‑6`)
  - Font families: `font‑grotesk‑bold` for titles, `font‑jetbrain` for body
  - Border radius: `rounded‑xl` for cards, `rounded‑full` for pill
  - No hard‑coded colors or style values

## Non‑Functional Requirements

### NFR‑1: Performance
- **ID**: NFR‑1
- **Description**: Profile screen must load within 2 seconds on average mobile hardware.
- **Acceptance Criteria**: No visible lag when scrolling; mock data renders instantly.

### NFR‑2: Code Quality
- **ID**: NFR‑2
- **Description**: Code must pass TypeScript strict checking and Expo lint without errors.
- **Acceptance Criteria**: `npm run lint` and `npx tsc --noEmit` produce zero errors.

### NFR‑3: Maintainability
- **ID**: NFR‑3
- **Description**: Profile screen should reuse existing components and tokens.
- **Acceptance Criteria**: No duplication of styling logic; all imports are used.

## Success Criteria
1. Profile screen visually matches the Explore and Leaderboard tabs (peer review).
2. All functional requirements are implemented and working (manual test).
3. TypeScript and lint checks pass with no errors.
4. No regression in existing functionality (smoke test of other tabs).

## Out of Scope
- Backend integration for stats/activity (currently uses mock data)
- Edit profile functionality
- View All activity navigation
- Settings page implementations
- Real‑time balance updates

## Notes
- The profile screen skeleton already existed; this enhancement polishes the UI.
- Mock data will be replaced with real API calls in a future phase.
- The design system is defined in `client/constants/ui‑tokens.ts` and `client/constants/explore‑theme.ts`.

## Addendum: Backend Handoff Requirements (2026-04-13)

This addendum is now canonical for backend integration planning tied to leaderboard and categories frontend screens.

### BH-CAT-01: Categories Endpoint
- **ID**: BH-CAT-01
- **Description**: `GET /markets/categories` must be publicly accessible and return JSON array of category keys.
- **Acceptance Criteria**:
  - Returns `200` with `string[]` payload.
  - Category keys are uppercase.

### BH-LB-01: Leaderboard Query Validation
- **ID**: BH-LB-01
- **Description**: `GET /leaderboard` validates query parameters.
- **Acceptance Criteria**:
  - `period` accepts only `weekly` or `all_time`; invalid values return `400`.
  - `page < 0` returns `400`.
  - `limit <= 0` or `limit > 100` returns `400`.

### BH-LB-02: Leaderboard Contract
- **ID**: BH-LB-02
- **Description**: `GET /leaderboard` returns paginated leaderboard envelope.
- **Acceptance Criteria**:
  - Returns `200` with `{ data, meta }`.
  - `meta` includes `page`, `limit`, `has_next_page`, `total_records`, `total_pages`.

### BH-LB-03: My Rank Endpoint
- **ID**: BH-LB-03
- **Description**: `GET /leaderboard/me` provides authenticated user's ranking data.
- **Acceptance Criteria**:
  - Missing/invalid token returns `401`.
  - Invalid `period` returns `400`.
  - Unranked user returns `404`.
  - Ranked user returns `200` with `position`, `username`, `avatar_url`, `wins`, `profit_pct`.

### BH-AUTH-01: Refresh Contract Compatibility
- **ID**: BH-AUTH-01
- **Description**: Existing refresh-token contract remains unchanged.
- **Acceptance Criteria**:
  - `POST /auth/refresh-token` accepts `{ "refresh_token": "<token>" }`.
  - Success response includes `access_token`.

## Addendum: Phase 3 Advanced Feature Requirements (2026-04-13)

### ADV-01: Market Creation Flow
- **ID**: ADV-01
- **Description**: Users can create new prediction markets with required market fields.
- **Acceptance Criteria**:
  - Market creation form supports title, description, category, and resolution date.
  - Backend validates required fields and returns 4xx for invalid input.
  - Created market is queryable from existing market listing/detail endpoints.

### ADV-02: Trading Interface
- **ID**: ADV-02
- **Description**: Users can buy/sell market shares from market detail experience.
- **Acceptance Criteria**:
  - Buy/sell actions call backend endpoints with auth and validated payloads.
  - Balance and position data update after successful trade.
  - Insufficient balance and invalid trade requests return clear errors.

### ADV-03: Realtime Updates
- **ID**: ADV-03
- **Description**: Market odds and user-relevant activity update in near-real time.
- **Acceptance Criteria**:
  - Socket events are emitted by backend on market/trade updates.
  - Client subscribes and applies updates without full-screen reload.
  - Reconnect behavior resyncs data after temporary disconnect.

### ADV-04: Notifications
- **ID**: ADV-04
- **Description**: Users receive actionable notifications for market resolution and price alerts.
- **Acceptance Criteria**:
  - Notification preferences and token registration are stored.
  - Backend triggers notifications for supported events.
  - Client displays notification payload with deep-link target.

### ADV-05: Social Features Baseline
- **ID**: ADV-05
- **Description**: Social primitives exist for following, comments, and leaderboard interactions.
- **Acceptance Criteria**:
  - Backend exposes follow/comment contracts with auth checks.
  - Client can render and submit comments for a market thread.
  - Follow state is persisted and queryable for profile/social views.
