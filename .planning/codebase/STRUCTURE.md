# Codebase Structure

**Analysis Date:** 2026-03-21

## Directory Layout

```
Prophetize/
├── client/                    # React Native Expo frontend
│   ├── app/                  # Expo Router screens
│   │   ├── tabs/             # Bottom tab screens
│   │   ├── *.tsx             # Top-level screens (login, signup, etc.)
│   │   └── _layout.tsx       # Root navigation layout with auth guard
│   ├── components/           # Reusable UI components by feature
│   │   ├── auth/             # Authentication components
│   │   ├── common/           # Shared components (loading, empty states)
│   │   ├── explore/          # Explore/market listing components
│   │   ├── home/             # Home screen components
│   │   ├── leaderboard/      # Leaderboard components
│   │   ├── market/           # Market detail components
│   │   ├── profile/          # Profile screen components
│   │   ├── skeleton/         # Skeleton loading components
│   │   └── ui/               # UI framework components (Gluestack)
│   ├── constants/            # Configuration and theming
│   ├── context/              # React Context providers (Auth)
│   ├── hooks/                # Custom React hooks
│   ├── utils/                # Utility functions (API client, helpers)
│   ├── assets/               # Static assets (fonts, images, icons)
│   ├── scripts/              # Build/deployment scripts
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   └── *.config.*            # Project configuration files
├── server/                   # Express.js backend
│   ├── src/
│   │   ├── config/          # Third-party client configuration (Supabase)
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware (auth, admin)
│   │   ├── routes/          # Route definitions
│   │   ├── services/        # Business logic (limited usage)
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Helper functions
│   │   └── index.ts         # Server entry point
│   └── package.json         # Server dependencies
├── docs/                    # Documentation (screenshots)
├── my-agent-os/             # Agent development files (unrelated to app)
├── .planning/               # Planning documents (generated)
└── .github/                 # GitHub workflows and agent configurations
```

## Directory Purposes

**client/app/:**
- Purpose: Screen components organized by Expo Router's file-based routing
- Contains: Top-level screens (`index.tsx`, `login.tsx`, `signUp.tsx`, etc.) and tab screens
- Key files: `_layout.tsx` (auth routing), `tabs/_layout.tsx` (bottom tab navigator)

**client/components/:**
- Purpose: Reusable UI components grouped by feature area
- Contains: Component files with `.tsx` extension, sometimes with accompanying styles
- Key files: `explore/prediction-card.tsx`, `common/loading-screen.tsx`, `auth/google-login.tsx`

**client/constants/:**
- Purpose: Centralized configuration values and design tokens
- Contains: Theme definitions, color tokens, API URLs, category mappings
- Key files: `ui-tokens.ts`, `ui-mappings.ts`, `backendUrl.ts`

**client/context/:**
- Purpose: React Context providers for global state
- Contains: Auth context with user/token management
- Key files: `AuthContext.tsx`

**client/utils/:**
- Purpose: Utility functions and API communication layer
- Contains: `api.ts` (HTTP client with token refresh), `prediction-helpers.ts`
- Key files: `api.ts` (primary API interface)

**server/src/config/:**
- Purpose: Configuration for external services
- Contains: Supabase client initialization
- Key files: `supabaseClient.ts`

**server/src/controllers/:**
- Purpose: Handle incoming HTTP requests, validate input, return responses
- Contains: Controller functions for each domain (market, user, transaction, portfolio)
- Key files: `marketController.ts` (largest controller), `userController.ts`

**server/src/middleware/:**
- Purpose: Express middleware for cross-cutting concerns
- Contains: Authentication and authorization middleware
- Key files: `authMiddleware.ts`, `adminMiddleware.ts`

**server/src/routes/:**
- Purpose: Define API endpoints and connect to controllers
- Contains: Route definitions with HTTP method mappings
- Key files: `marketRoutes.ts`, `userRoutes.ts`

**server/src/types/:**
- Purpose: TypeScript type definitions for request/response shapes
- Contains: Extended Express types, category enums, portfolio types
- Key files: `authRequest.ts`, `marketCategories.ts`

## Key File Locations

**Entry Points:**
- `client/app/_layout.tsx`: Client entry with auth routing
- `server/src/index.ts`: Server entry with Express setup

**Configuration:**
- `client/tailwind.config.js`: Design system configuration
- `client/constants/ui-tokens.ts`: Color and spacing tokens
- `server/src/config/supabaseClient.ts`: Database connection

**Core Logic:**
- `client/utils/api.ts`: API communication layer
- `server/src/controllers/marketController.ts`: Market business logic
- `server/src/middleware/authMiddleware.ts`: Authentication logic

**Testing:**
- Not detected - no test files found in typical locations

## Naming Conventions

**Files:**
- **Components**: kebab-case or PascalCase for component files (`prediction-card.tsx`, `PredictionCard.tsx`)
- **Screens**: kebab-case for route files (`explore-details.tsx`), PascalCase for component names
- **Utilities**: camelCase for utility files (`api.ts`, `prediction-helpers.ts`)
- **Types**: camelCase with `.ts` extension (`authRequest.ts`, `marketCategories.ts`)

**Directories:**
- **Feature-based grouping**: `components/explore/`, `components/home/`
- **Plural names**: `components`, `constants`, `controllers`, `middleware`
- **Singular for specific**: `context`, `hooks`, `utils`

## Where to Add New Code

**New Feature (e.g., Notifications):**
- Primary code: `client/components/notifications/` for UI components
- Screen: `client/app/notifications.tsx` for new route
- Server endpoint: `server/src/controllers/notificationController.ts`
- Server route: `server/src/routes/notificationRoutes.ts`
- Types: `server/src/types/notification.ts`

**New Component (e.g., Enhanced Card):**
- Implementation: `client/components/common/` or feature-specific directory
- Tests: Currently no test pattern established

**Utilities:**
- Shared helpers: `client/utils/` (e.g., `formatting.ts`)
- Server helpers: `server/src/utils/`

**API Endpoint:**
- Controller: `server/src/controllers/` with appropriate domain
- Route: `server/src/routes/` with path and method mapping
- Types: `server/src/types/` for request/response shapes

## Special Directories

**client/.expo/:**
- Purpose: Expo development cache and generated files
- Generated: Yes, by Expo CLI
- Committed: No (gitignored)

**client/assets/:**
- Purpose: Static assets (fonts, images, app icons)
- Generated: Some (app icons), others manually added
- Committed: Yes

**my-agent-os/:**
- Purpose: Agent development and learning files unrelated to the Prophetize application
- Generated: Partially by agent workflows
- Committed: Yes

---

*Structure analysis: 2026-03-21*