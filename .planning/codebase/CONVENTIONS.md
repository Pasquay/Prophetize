# Coding Conventions

**Analysis Date:** 2026-03-21

## Naming Patterns

**Files:**
- kebab-case for component and utility files (e.g., `wide-button.tsx`, `google-login.tsx`)
- camelCase for non‑component files (e.g., `ui-tokens.ts`, `supabase.ts`)
- PascalCase for TypeScript type/interface files not detected (types are co‑located)

**Functions:**
- camelCase for regular functions and hooks (e.g., `register`, `login`, `useAuth`)
- PascalCase for React component default exports (e.g., `Button`, `GoogleLogin`, `WelcomeScreen`)

**Variables:**
- camelCase for variables and constants (e.g., `user`, `rewardAmount`, `UI_COLORS`)
- UPPER_SNAKE_CASE for environment variables (e.g., `EXPO_PUBLIC_SUPABASE_URL`)

**Types:**
- PascalCase for type aliases and interfaces (e.g., `Props`, `AuthRequest`)
- Generic type parameters use single uppercase letters (`T`, `U`)

## Code Style

**Formatting:**
- Tool: Prettier (via `eslint-config-expo`) with default Expo styling
- Key settings: 2‑space indentation, double quotes for strings, semicolons required
- VS Code settings auto‑fix on save (`source.fixAll`, `source.organizeImports`) in `client/.vscode/settings.json`

**Linting:**
- Tool: ESLint with `eslint-config-expo` configuration
- Run command: `npm run lint` (client only)
- No custom `.eslintrc` file; uses Expo’s recommended rules

**Styling (Tailwind / NativeWind):**
- Framework: NativeWind (Tailwind CSS for React Native)
- Config file: `client/tailwind.config.js` – extensive design token system
- Usage: ClassName prop with Tailwind utility classes (e.g., `className="flex-row items-center justify-center p-4 rounded-full gap-[8px]"`)
- Custom design tokens: Colors, fonts, spacing, shadows defined as CSS variables
- Color system: Use `UI_COLORS` constants from `@/constants/ui-tokens` for semantic colors
- Font families: Custom Google Fonts (Inter, Space Grotesk, JetBrains Mono) loaded via `@expo-google-fonts`
- Responsive design: Use `useWindowDimensions` hook for dynamic sizing, not breakpoint utilities

## Import Organization

**Order:**
1. External libraries (React, Expo, third‑party)
2. Internal aliases (`@/*`, `@/components`, `@/utils`)
3. Relative imports (`./`, `../`)
4. Type‑only imports (`import type ...`)

**Path Aliases:**
- `@/*` → `./*` (client root) – configured in `client/tsconfig.json`
- `tailwind.config` → `./tailwind.config.js`

**Import Style:**
- Named imports preferred over default imports for utilities (`import { supabase } from '@/utils/supabase'`)
- Default imports for components (`import WideButton from '@/components/auth/wide-button'`)
- Avoid namespace imports except for grouping related exports (`import * as api from '@/utils/api'`)

## Error Handling

**Server (Express):**
- Use `try/catch` blocks for async controllers
- Return appropriate HTTP status codes (400, 401, 500) with JSON error messages
- Pattern: `return res.status(400).json({ error: error.message })`
- Example: `server/src/controllers/userController.ts`

**Client (React Native):**
- `try/catch` with `Alert.alert()` for user‑facing errors
- Log detailed errors to console for debugging (`console.error('Google Sign-In Error Detail:', error)`)
- Supabase errors handled via `error` field in response objects

## Logging

**Framework:** `console.log` / `console.error`

**Patterns:**
- Log errors with descriptive messages and full error objects
- Avoid excessive logging in production‑bound code
- No structured logging library in use

## Comments

**When to Comment:**
- Document complex business logic (e.g., streak calculation in `claimAllowance`)
- Explain Supabase RLS bypass rationale (`// use admin client to bypass RLS`)
- Clarify non‑obvious arithmetic or date manipulations

**JSDoc/TSDoc:**
- Not used; reliance on TypeScript types for documentation

## Function Design

**Size:** Functions are kept relatively focused; larger controllers (~100 lines) are acceptable for cohesive operations

**Parameters:** Destructured object parameters for components (`Props`), inline destructuring for route handlers (`req.body`)

**Return Values:**
- Server: Always return an HTTP response (JSON success/error)
- Client: Components return JSX; hooks return state/setters

## State Management

**Client:**
- Zustand used for global state (installed as dependency)
- Pattern: Create stores with slices for specific domains (no store files found yet)
- Use `useAuth` custom hook (context) for authentication state (`client/context/AuthContext.tsx`)

**Server:**
- Stateless; no application‑level state management (rely on Supabase database)

## Module Design

**Exports:**
- Single default export per React component file
- Named exports for utilities, constants, and controllers (`export const register`, `export const UI_COLORS`)
- Barrel files not used; direct imports from individual files

**Barrel Files:** Not detected

---

*Convention analysis: 2026-03-21*