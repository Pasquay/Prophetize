---
status: complete
phase: 03-advanced-features
source: [03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md, 03-04-SUMMARY.md]
started: 2026-04-13T12:50:21.1453841Z
updated: 2026-04-13T13:05:27.4133428Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running server process, then start backend from scratch. Server boots cleanly without startup errors, and a basic request (for example categories/health) returns live data.
result: pass

### 2. Create Market Shows Pending Approval
expected: Submitting a valid new market succeeds and the UI clearly says it is pending admin approval.
result: skipped
reason: no market creation screen created yet

### 3. Pending Market Hidden From Public Views
expected: A newly created pending market does not appear in public listings/details until approved.
result: skipped
reason: cannot test taht

### 4. Buy/Sell Trading Flow Updates Wallet and Position
expected: On an approved market, buy/sell actions complete successfully, prevent duplicate submit spam, and refresh visible balance/position state.
result: issue
reported: "Trade failed. Cannot coerce the result into  a single JSON object"
severity: blocker

### 5. Realtime Home and Leaderboard Resync
expected: After a trade, Home/Leaderboard data updates via realtime; after disconnect/reconnect, screens resync without duplicate spam updates.
result: skipped
reason: Cannot test yet

### 6. Notification Route Targeting Works
expected: Opening a notification target routes correctly to supported destinations (market, leaderboard, or profile) and rejects unsupported targets safely.
result: skipped
reason: skip all tests for nwo, most don't have frontend no?

### 7. Follow and Unfollow Interaction Works
expected: Follow/unfollow action succeeds from social notification flow and updates visible follow state without app instability.
result: skipped
reason: skip all tests for nwo, most don't have frontend no?

### 8. Market Comments Post and Render
expected: On market detail, comments list loads and posting a valid comment shows it in the thread with sanitized output.
result: skipped
reason: skip all tests for nwo, most don't have frontend no?

## Summary

total: 8
passed: 1
issues: 1
pending: 0
skipped: 6
blocked: 0

## Gaps

- truth: "On an approved market, buy/sell actions complete successfully and refresh balance/position state."
  status: failed
  reason: "User reported: Trade failed. Cannot coerce the result into  a single JSON object"
  severity: blocker
  test: 4
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
