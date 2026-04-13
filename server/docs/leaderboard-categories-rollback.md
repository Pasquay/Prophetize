# Leaderboard + Categories Rollback Runbook

## Purpose

Provide a deterministic rollback path for leaderboard/categories backend deployment while preserving auth refresh-token compatibility.

## Scope

- Endpoint group: `/leaderboard` and `/markets/categories`
- Compatibility lock: `POST /auth/refresh-token` request and response contract

## Preconditions

- You are on the backend repository root.
- You have access to deploy environment variables.
- `BASE_URL` points to the target environment (staging or production).

## Smoke Checks Before Rollback (Forward State)

Set common variables:

```bash
export BASE_URL="https://<api-host>"
export AUTH_BEARER="<valid-user-access-token>"
export REFRESH_TOKEN="<valid-user-refresh-token>"
```

Run checks:

```bash
curl -i "$BASE_URL/markets/categories"
curl -i "$BASE_URL/leaderboard?period=weekly&page=0&limit=10"
curl -i -H "Authorization: Bearer $AUTH_BEARER" "$BASE_URL/leaderboard/me?period=weekly"
curl -i -X POST "$BASE_URL/auth/refresh-token" -H "Content-Type: application/json" -d '{"refresh_token":"'$REFRESH_TOKEN'"}'
```

Expected outcomes in forward state:

- `GET /markets/categories` -> `200`
- `GET /leaderboard?period=weekly&page=0&limit=10` -> `200`
- `GET /leaderboard/me?period=weekly` with valid bearer -> `200` or `404` (no rank)
- `POST /auth/refresh-token` with `{ "refresh_token": "..." }` -> `200` and JSON includes `access_token` (string)

## Rollback Procedure

### Step 1: Disable leaderboard route mount

Edit `server/src/index.ts` and remove or comment the leaderboard route import/mount:

- Remove/comment `import leaderboardRoutes from '../src/routes/leaderboardRoutes';`
- Remove/comment `app.use('/leaderboard', leaderboardRoutes);`

This is the fastest emergency route-level rollback and should restore pre-leaderboard behavior.

### Step 2: Revert deployment commit(s)

Use git to revert backend integration commit(s) if route-level rollback is not sufficient:

```bash
git log --oneline -20
git revert <commit_hash>
```

If multiple commits are required, revert from newest to oldest and resolve conflicts.

### Step 3: Rebuild/redeploy backend

Use your standard backend deployment pipeline after the revert.

## Smoke Checks After Rollback (Rollback State)

Run checks again:

```bash
curl -i "$BASE_URL/markets/categories"
curl -i "$BASE_URL/leaderboard?period=weekly&page=0&limit=10"
curl -i -H "Authorization: Bearer $AUTH_BEARER" "$BASE_URL/leaderboard/me?period=weekly"
curl -i -X POST "$BASE_URL/auth/refresh-token" -H "Content-Type: application/json" -d '{"refresh_token":"'$REFRESH_TOKEN'"}'
```

Expected outcomes in rollback state:

- `GET /markets/categories` -> `200`
- `GET /leaderboard?period=weekly&page=0&limit=10` -> `404`
- `GET /leaderboard/me?period=weekly` -> `404`
- `POST /auth/refresh-token` -> `200` with JSON that includes `access_token` (string)

## Verification Commands

Contract test lock:

```bash
cd server && npm run test -- tests/contracts/auth-refresh.contract.test.ts
```

Runbook file existence:

```bash
test -f server/docs/leaderboard-categories-rollback.md
```

## Exit Criteria

- Rollback commands are executable end-to-end.
- Forward and rollback status-code expectations match actual behavior.
- Refresh-token contract compatibility remains intact.
