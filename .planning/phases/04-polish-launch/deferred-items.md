# Deferred Items

## 2026-04-13

- Out-of-scope lint blocker observed during 04-02 verification: `client/app/login.tsx` has `react/no-unescaped-entities` error at line 147. This file is unrelated to 04-02 task scope and was not modified.
- Same out-of-scope lint blocker still fails `npm run lint` during 04-03 verification: `client/app/login.tsx` line 147 (`react/no-unescaped-entities`). 04-03 task files compile successfully with `npx --yes tsc --noEmit`.
