# External Integrations

**Analysis Date:** 2026-03-21

## APIs & External Services

**Database & Backend:**
- Supabase - PostgreSQL database with real-time subscriptions, authentication, and storage
  - SDK/Client: `@supabase/supabase-js`
  - Auth: Supabase Auth with email/password and JWT tokens
  - Environment variables:
    - Client: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_KEY`
    - Server: `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_KEY`

**Authentication:**
- Supabase Auth - Primary authentication system
  - Implementation: Email/password sign-up/login, session management with refresh tokens
  - Google OAuth - Plugin configured (`@react-native-google-signin/google-signin`) but not yet implemented in code

**Real-time Communication:**
- Socket.io - Package included but no implementation found yet
  - Client: `socket.io-client ^4.8.3`
  - Server: `socket.io ^4.8.3`
  - Purpose: Potential real‑time updates for market prices, leaderboard, portfolio changes

## Data Storage

**Databases:**
- Supabase PostgreSQL - Primary relational database
  - Connection: Via Supabase client using environment variables
  - Client: `@supabase/supabase-js` with row‑level security (RLS)

**File Storage:**
- Supabase Storage - Not yet implemented; images referenced via `image_url` fields

**Caching:**
- SecureStore (expo‑secure‑store) - Token storage on client
- AsyncStorage - General client‑side storage

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (built‑in)
  - Implementation: Custom auth flow with email/password, JWT sessions stored in SecureStore
  - Profile synchronization: Server‑side `profiles` table linked to auth users via `id`

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Console logging only

## CI/CD & Deployment

**Hosting:**
- Mobile: Expo Application Services (EAS) - configured in `eas.json`
- Server: Not yet deployed; local development server

**CI Pipeline:**
- Not configured

## Environment Configuration

**Required env vars:**

**Client (`.env`):**
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_KEY` - Supabase anonymous/public key
- `EXPO_PUBLIC_BACKEND_URL` - Backend server URL (default: `http://169.254.83.107:3001`)

**Server (`.env`):**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase anonymous/public key
- `SUPABASE_SERVICE_KEY` - Supabase service role key (bypasses RLS)
- `PORT` - Server port (default: 3000)

**Secrets location:**
- Local `.env` files (never committed)
- EAS environment variables for build‑time configuration (see `eas.json`)

## Webhooks & Callbacks

**Incoming:**
- None configured

**Outgoing:**
- None configured

---

*Integration audit: 2026-03-21*