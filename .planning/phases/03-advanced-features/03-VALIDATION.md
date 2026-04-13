---
phase: 03
slug: advanced-features
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-13
---

# Phase 03 - Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | Vitest + Supertest |
| Config file | server/vitest.config.ts |
| Quick run command | `cd server && npm run test -- tests/contracts` |
| Full suite command | `cd server && npm run test` |
| Estimated runtime | ~45s |

## Sampling Rate

- After every task commit: run route-specific contract tests.
- After every wave: run full server contract set.
- Before verify-work: run full suite and smoke-check client integration.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command |
|---------|------|------|-------------|-----------|-------------------|
| 03-01-01 | 01 | 1 | ADV-01 | integration | `cd server && npm run test -- tests/contracts/market-create.contract.test.ts` |
| 03-02-01 | 02 | 2 | ADV-02 | integration | `cd server && npm run test -- tests/contracts/trading.contract.test.ts` |
| 03-03-01 | 03 | 3 | ADV-03 | integration | `cd server && npm run test -- tests/contracts/realtime.contract.test.ts` |
| 03-04-01 | 04 | 4 | ADV-04/ADV-05 | integration | `cd server && npm run test -- tests/contracts/notifications-social.contract.test.ts` |

## Wave 0 Requirements

- [ ] Add missing contract test files listed above.
- [ ] Add any missing socket integration harness for realtime tests.

## Validation Sign-Off

- [ ] All plans have automated verify commands.
- [ ] No more than two tasks between automated checks.
- [ ] `nyquist_compliant: true` set after implementation verification.
