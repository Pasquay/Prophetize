# Deferred Items

## 2026-04-13

- Out-of-scope pre-existing parse error blocks Vitest execution path:
  - File: `server/src/services/leaderboardService.ts`
  - Symptom: `Unexpected "}"` at line 121 during transform
  - Impact: `npm run test -- tests/contracts/auth-refresh.contract.test.ts` fails before tests run
  - Scope decision: Not fixed in plan 02-02 because this plan only modifies auth refresh contract lock + rollback runbook.
