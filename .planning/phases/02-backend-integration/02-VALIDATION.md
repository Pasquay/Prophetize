---
phase: 02
slug: backend-integration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-13
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + Supertest |
| **Config file** | `server/vitest.config.ts` (Wave 0 if missing) |
| **Quick run command** | `cd server && npm run test -- contracts:smoke` |
| **Full suite command** | `cd server && npm run test` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd server && npm run test -- contracts:smoke`
- **After every plan wave:** Run `cd server && npm run test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | BH-CAT-01 | T-02-01 / — | Categories endpoint rejects malformed inputs and returns uppercase key array contract | integration | `cd server && npm run test -- contracts:smoke -- categories` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | BH-LB-01/BH-LB-02 | T-02-01 / T-02-04 | Leaderboard validates period/page/limit and returns strict `{data,meta}` envelope | integration | `cd server && npm run test -- contracts:smoke -- leaderboard` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | BH-LB-03 | T-02-02 / T-02-03 | `/leaderboard/me` enforces auth and 401/400/404/200 semantics | integration | `cd server && npm run test -- contracts:smoke -- leaderboard-me` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | BH-AUTH-01 | T-02-02 / — | Refresh-token contract unchanged and backward-compatible | integration | `cd server && npm run test -- contracts:smoke -- auth-refresh` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `server/tests/setup.ts` — test harness + app bootstrap for HTTP contract tests
- [ ] `server/tests/contracts/leaderboard.contract.test.ts` — leaderboard list + me endpoint assertions
- [ ] `server/tests/contracts/categories.contract.test.ts` — categories payload assertions
- [ ] `server/tests/contracts/auth-refresh.contract.test.ts` — refresh compatibility assertions
- [ ] `server/package.json` test scripts + deps (`vitest`, `supertest`, types)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| End-to-end client integration with live backend | BH-CAT-01, BH-LB-02, BH-LB-03 | Requires running mobile client + backend together | Start server, open app leaderboard/categories screens, verify data renders and pagination interactions |
| Rollback safety procedure | BH-AUTH-01 | Operational runbook validation across deploy/revert boundary | Execute rollback runbook steps and run curl smoke checks pre/post rollback |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
