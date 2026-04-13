# Deferred Items (Resolved)

## 2026-04-13

- Out-of-scope pre-existing parse error blocked Vitest execution path (now fixed):
  - File: `server/src/services/leaderboardService.ts`
  - Symptom: `Unexpected "}"` at line 121 during transform
  - Impact: initially caused `npm run test -- tests/contracts/auth-refresh.contract.test.ts` to fail before tests ran
  - Resolution: syntax corrected; auth-refresh and leaderboard contract tests now pass.
