# Architecture

**Analysis Date:** 2026-03-21

## Pattern Overview

**Overall:** Client-Server with Layered Express.js backend and React Native (Expo) frontend

**Key Characteristics:**
- **Monorepo-like separation**: Client and server in separate directories with independent package.json
- **RESTful API**: Express.js routes with controller-service pattern
- **Navigation-based UI**: Expo Router for file-based navigation with authentication flows
- **Supabase Integration**: Direct Supabase client usage in server, client uses custom API layer
- **Token-based Authentication**: JWT tokens stored in SecureStore, with refresh token handling
- **Component-based UI**: React Native components organized by feature, using Tailwind CSS via NativeWind

## Layers

**Client UI Layer:**
- Purpose: Render mobile interfaces and handle user interactions
- Location: `client/app/`, `client/components/`
- Contains: Screens (`*.tsx`), components (`components/*`), layout (`_layout.tsx`)
- Depends on: Context (Auth), utils (api), constants
- Used by: Expo Router navigation

**Client State Layer:**
- Purpose: Manage authentication state and provide it to UI
- Location: `client/context/AuthContext.tsx`
- Contains: Auth context provider, secure storage integration
- Depends on: `expo-secure-store`, `utils/api`
- Used by: App layout and screens

**API Communication Layer:**
- Purpose: Abstract HTTP requests to backend with token management
- Location: `client/utils/api.ts`
- Contains: `get`, `post` functions, token refresh logic, leaderboard types
- Depends on: `expo-secure-store`, `constants/backendUrl`
- Used by: Components and screens for data fetching

**Server Route Layer:**
- Purpose: Define REST endpoints and connect to controllers
- Location: `server/src/routes/`
- Contains: Route definitions with middleware (`authMiddleware`, `adminMiddleware`)
- Depends on: Controllers, middleware
- Used by: Express app in `server/src/index.ts`

**Server Controller Layer:**
- Purpose: Handle HTTP requests, validate input, orchestrate business logic
- Location: `server/src/controllers/`
- Contains: Controller functions for markets, users, transactions, portfolio
- Depends on: Services (limited), Supabase client, utility functions
- Used by: Routes

**Server Data Layer:**
- Purpose: Direct database interactions via Supabase client
- Location: `server/src/config/supabaseClient.ts`
- Contains: Supabase client configuration
- Depends on: Environment variables, `@supabase/supabase-js`
- Used by: Controllers and services

**Cross-Cutting Utilities:**
- Purpose: Shared helper functions
- Location: `server/src/utils/`, `client/utils/`
- Contains: Pagination helpers, prediction normalization, etc.
- Depends on: None
- Used by: Controllers and components

## Data Flow

**Market Data Fetching:**

1. Component calls `get('/markets/trending')` from `client/utils/api.ts`
2. API layer adds auth token, sends request to backend
3. Route `server/src/routes/marketRoutes.ts` routes to `getTrendingMarkets` controller
4. Controller uses Supabase client to query `market_24h_stats` and `markets` tables
5. Data is transformed and paginated, returned as JSON
6. Component receives data and renders via `PredictionCard` component

**Authentication Flow:**

1. User logs in via Google Sign-In or credentials
2. Client sends credentials to `/auth/login` endpoint
3. Server validates, returns JWT tokens
4. Client stores tokens in SecureStore via `AuthContext.login()`
5. App layout (`_layout.tsx`) checks auth state and redirects accordingly
6. Subsequent API requests automatically include tokens

**State Management:**
- **Auth State**: React Context (`AuthContext`) with SecureStore persistence
- **UI State**: Local component state using React hooks
- **Server State**: No client-side caching layer (direct API calls)

## Key Abstractions

**Prediction/Market:**
- Purpose: Represents a prediction market with options, probabilities, volume
- Examples: `client/.expo/types/model.ts`, `server/src/types/marketCategories.ts`
- Pattern: Consistent data structure across client and server

**AuthRequest:**
- Purpose: Extended Express Request with user authentication data
- Examples: `server/src/types/authRequest.ts`
- Pattern: Middleware augments request with user info for protected routes

**API Response Wrapper:**
- Purpose: Standardized error handling and token refresh
- Examples: `client/utils/api.ts` `handleResponse` function
- Pattern: Intercept 401 responses, attempt refresh, retry request

## Entry Points

**Client Entry Point:**
- Location: `client/app/_layout.tsx`
- Triggers: Expo Router initialization
- Responsibilities: Auth provider setup, font loading, root navigation stack, auth-based routing

**Server Entry Point:**
- Location: `server/src/index.ts`
- Triggers: Node.js process start
- Responsibilities: Express app configuration, route mounting, server startup

## Error Handling

**Strategy:** Centralized error handling in API layer, try-catch in controllers

**Patterns:**
- **Server Controllers**: Try-catch blocks returning appropriate HTTP status codes
- **Client API**: `handleResponse` function for token refresh and error propagation
- **UI Errors**: Conditional rendering with fallback components (`EmptyState`)

## Cross-Cutting Concerns

**Logging:** Console logging in development, no production logging system observed
**Validation:** Request validation in controllers (basic type checking)
**Authentication:** JWT tokens with middleware (`authMiddleware.ts`, `adminMiddleware.ts`)
**Pagination:** Utility function `getPaginationRange` in `server/src/utils/pagination.ts`

---

*Architecture analysis: 2026-03-21*