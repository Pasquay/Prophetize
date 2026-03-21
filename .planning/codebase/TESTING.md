# Testing Patterns

**Analysis Date:** 2026-03-21

## Test Framework

**Runner:**
- No test runner configured (Jest, Vitest, etc. not installed)
- Client `package.json` contains no test script
- Server `package.json` test script: `"test": "echo \"Error: no test specified\" && exit 1"`

**Assertion Library:**
- Not applicable

**Run Commands:**
```bash
npm test          # Server only – prints error message
# No client test command
```

## Test File Organization

**Location:**
- No test files present in the codebase

**Naming:**
- Not applicable

**Structure:**
- Not applicable

## Test Structure

**Suite Organization:**
- Not applicable

**Patterns:**
- Not applicable

## Mocking

**Framework:** Not applicable

**Patterns:**
- Not applicable

**What to Mock:**
- Not applicable

**What NOT to Mock:**
- Not applicable

## Fixtures and Factories

**Test Data:**
- Not applicable

**Location:**
- Not applicable

## Coverage

**Requirements:** No coverage tooling configured

**View Coverage:**
- Not applicable

## Test Types

**Unit Tests:**
- No unit tests present

**Integration Tests:**
- No integration tests present

**E2E Tests:**
- Not used

## Common Patterns

**Async Testing:**
- Not applicable

**Error Testing:**
- Not applicable

## Recommendations for Adding Testing

**Client (React Native / Expo):**
- Consider Jest with `@testing-library/react-native` and `@testing-library/jest-native`
- Expo provides testing guidance: `expo test`
- Place test files co‑located with source (`component.test.tsx`) or in a `__tests__` folder

**Server (Express / TypeScript):**
- Use Jest or Vitest with `supertest` for HTTP endpoint testing
- Mock Supabase client with dependency injection or a wrapper
- Test controllers in isolation from database

**Initial Setup Steps:**
1. Install dev dependencies (jest, types, testing‑library)
2. Create `jest.config.js` with appropriate preset (expo, node)
3. Add test scripts to `package.json`
4. Write a smoke test to verify the setup works

---

*Testing analysis: 2026-03-21*