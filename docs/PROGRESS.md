# Progress

Status: Phase 2 done. Next: Phase 3 (Auth). No deployment work until told.

## Start here: recap in plain words

### What you asked for
Turn logfit.io from a browser-only prototype into a real app for your portfolio: accounts, a real database, data synced across devices, installable on a phone, tested, with a "Try the demo" button. The work is split into 7 phases (full brief in docs/PLAN.md). Stop after each phase so you can test. No deployment until you say so.

### Where we are
| Phase | What | State |
|---|---|---|
| 1 | Plan, docs, rules | Done |
| 2 | Backend foundation (API, database, seed data) | Done |
| 3 | Login and sign up | Next |
| 4 | App uses the database instead of localStorage | Not started |
| 5 | Installable phone app, accessibility | Not started |
| 6 | Automated tests | Not started |
| 7 | Deploy, demo account, README | Not started, needs your OK first |

### Why the app looks the same
Phases 1 and 2 were groundwork only. The screens still read and write localStorage exactly as before. Visible changes start in Phase 3 (log-in and sign-up screens) and Phase 4 (workouts saved to the database, new exercise picker, kg/lb setting).

### What changed in the files, and why
1. **web/**: the existing app, moved here unchanged except for 2 small lint fixes (web/src/components/Timer.tsx, web/src/pages/Workout.tsx) and a dev proxy in web/vite.config.ts that forwards `/api` calls to the API.
2. **api/**: new backend (Express + TypeScript). Only one route so far, `GET /api/health`.
3. **api/prisma/**: database schema (users, exercises, workouts, sets, refresh tokens), the first migration, and a seed of 88 exercises.
4. **docker-compose.yml**: runs Postgres locally on port 5433 (5432 was taken by your aisle-postgres container).
5. **package.json (root)**: links web/ and api/, and `npm run dev` starts everything.
6. **package-lock.json**: rewritten for the two workspaces. This is the big diff.
7. **.env.example, api/.env.example**: templates. Your real `.env` files exist locally but are gitignored.
8. **docs/PLAN.md, docs/PROGRESS.md**: the brief and this file.

### File guide: what each new file is
Where they came from: you asked in Phase 2 (docs/PLAN.md) for "api/ with Node, Express, TypeScript, zod, Prisma with PostgreSQL, Docker Postgres, a Prisma schema, migrations, and a seed with about 80 exercises". These files are that.

**Background terms**
- **Prisma**: a library that lets TypeScript code talk to the Postgres database. You describe your tables once in `schema.prisma`, and Prisma generates fully typed functions like `prisma.workout.findMany()`, so you don't write raw SQL and typos are caught by TypeScript.
- **Migration**: a SQL file that creates or changes tables. Prisma writes it for you from the schema. Running the migrations on any database (your laptop, production) gives it exactly the same tables.
- **Seed**: a script that fills the database with starting data. Here, that's the list of built-in exercises.

**Database (api/prisma/)**
| File | What it does |
|---|---|
| `schema.prisma` | The table definitions: users, exercises, workouts, workout_exercises, workout_sets, refresh_tokens. The single source of truth for the database. |
| `migrations/..._init/migration.sql` | The SQL Prisma generated from the schema. It's what actually created the tables. Commit it. |
| `migrations/migration_lock.toml` | Records which database type the migrations are for (Postgres). Prisma manages it. |
| `exercises.ts` | The list of 88 exercises (name, muscle group, equipment). Replaces web/src/data/exercises.ts once Phase 4 is done. |
| `seed.ts` | Loads `exercises.ts` into the database. Safe to run again, it updates instead of duplicating. |
| `../prisma.config.ts` | Tells the Prisma command line tool where the schema, migrations and seed are, and which database to use. |

**API server (api/src/)**
| File | What it does |
|---|---|
| `server.ts` | Starts the API on port 4000. The entry point for local dev. |
| `app.ts` | Builds the Express app: security headers (helmet), CORS, JSON body parsing, cookies, routes, error handling. Kept separate from `server.ts` so tests (Phase 6) and Vercel can use the app without starting a server. |
| `env.ts` | Reads settings from `api/.env` (database URL, port, web app URL) and refuses to start if one is missing or wrong. |
| `lib/db.ts` | Creates the one shared Prisma database connection the rest of the API imports. |
| `lib/http-error.ts` | A small error class so a route can say "404 Not found" or "401 Unauthorized" by throwing. |
| `middleware/error-handler.ts` | Turns any error into a clean JSON response (400 for bad input, 404 for unknown routes, 500 otherwise) without leaking internals. |
| `routes/health.ts` | `GET /api/health`. Returns `{"status":"ok"}` if the API can reach the database. Used to check everything is wired up, and later by the host for monitoring. Real routes (auth, workouts) come in Phases 3 and 4. |
| `generated/prisma/` | Code Prisma generates from the schema. Not committed (gitignored), rebuilt on `npm install`. |

**Config (api/)**
| File | What it does |
|---|---|
| `package.json` | The API's dependencies and scripts (`dev`, `build`, `db:migrate`, `db:seed`, ...). |
| `tsconfig.json`, `tsconfig.build.json` | TypeScript settings. The build one compiles only `src/` to `dist/`. |
| `eslint.config.js` | Lint rules, same style as web/. |
| `.env.example` | Template for `api/.env`. The real `.env` holds the database password and is gitignored. |

### How to see it working
1. `npm run dev` from the repo root.
2. http://localhost:5173 shows the app (unchanged).
3. http://localhost:5173/api/health shows `{"status":"ok"}`, which means the app, API and database are all connected.
4. Optional: `cd api && npx prisma studio` to browse the database tables and the 88 seeded exercises.

### Waiting on you
1. Review and commit when ready (the move into web/ is already staged as renames).
2. Say "go" for Phase 3.

## Decisions made
1. Demo: a fresh throwaway demo user per "Try the demo" tap, deleted after 7 days (`users.is_demo`).
2. In-progress workout: local draft on the device, saved to the API on Finish. `workouts.client_id` is unique per user so retries and imports never duplicate.
3. Rate limiting: Postgres-backed counter table (add in Phase 3).
4. Hosting: Vercel (web + Express under /api) plus Neon. Confirm before creating anything in Phase 7.
5. Weights are stored in kg (`Decimal(7,3)`). The kg/lb setting only changes display and input.
6. api uses TypeScript 5.9 and ESLint 9 to match web. TS 7 and ESLint 10 are out but are a separate upgrade.
7. Prisma pinned to 7.10.0. The npm `latest` tag points to an 8.0 release candidate.

## How to run locally
1. `cp .env.example .env` and `cp api/.env.example api/.env`, set the same password in both.
2. `npm install`
3. `npm run dev` starts Postgres (port 5433), applies migrations, seeds the exercises, then runs the API (4000) and web (5173). Vite proxies /api to the API.
4. `npm run db:seed` reloads the 88 built-in exercises on its own (safe to rerun).
5. `npm run lint`, `npm run typecheck`, `npm run build` run in both workspaces.

## Notes for the next session
- Prisma 7: config in api/prisma.config.ts, client generated to api/src/generated/prisma (gitignored), uses @prisma/adapter-pg. `migrate dev` no longer runs the seed automatically.
- npm 11 holds back dependency install scripts (prisma engines, esbuild) until approved. Everything works without approving them so far.
- `npm audit`: 4 high findings remain, all inside the Prisma CLI (dev only, mysql2 is never loaded). The only fix is `--force`, which changes the Prisma version.
- Stats route is still commented out in web/src/App.tsx (the user's own uncommitted change). Will be revisited in Phase 4.

## Known issues in the current code
- [x] `npm run lint` failed: unused `_props` in Timer.tsx (removed the unused props)
- [x] Lint warning: missing deps in useEffect in Workout.tsx
- [ ] Stats route is commented out in web/src/App.tsx, but the nav still links to /stats
- [ ] index.html title says "IRON. | Workout Tracker" and the favicon is the Vite logo (fix in Phase 5)

## Phase 1: Plan
- [x] Read the code
- [x] docs/PLAN.md
- [x] docs/PROGRESS.md
- [x] Working rules file (local only, gitignored)
- [x] Flag risks in the brief

## Phase 2: Backend foundation
- [x] Move the Vite app into web/, set up npm workspaces
- [x] api/ with Express, TypeScript, zod, helmet, error handler
- [x] docker-compose.yml with Postgres
- [x] Prisma schema: users, exercises, workouts, workout exercises, sets, refresh tokens
- [x] First migration
- [x] Seed about 80 exercises with muscle group and equipment
- [x] One command starts db, api and web
- [x] .env.example files, .env gitignored
- [x] Fix the known lint issues

## Phase 3: Auth
- [ ] POST /api/auth/signup, /login, /refresh, /logout
- [ ] argon2id hashing
- [ ] Access token (15 min) in memory, refresh cookie rotated and stored hashed
- [ ] Reuse detection (revoke the token family)
- [ ] Rate limiting, CORS, helmet
- [ ] Sign-up and log-in screens, protected routes, silent refresh
- [ ] Token flow walkthrough

## Phase 4: Workouts
- [ ] API CRUD: workouts, workout exercises, sets
- [ ] Exercises: list with search and filters, create custom
- [ ] Replace localStorage in Home, Lift, Log, Stats
- [ ] Exercise picker with search, muscle group and equipment filters
- [ ] kg/lb setting
- [ ] Import local workouts on first login
- [ ] Loading, empty and error states on every screen

## Phase 5: Phone
- [ ] PWA: manifest, icons, service worker
- [ ] iOS and Android install check
- [ ] Mobile polish
- [ ] Accessibility: labels, keyboard, focus, contrast

## Phase 6: Tests
- [ ] Vitest + Supertest: auth
- [ ] Vitest + Supertest: workouts
- [ ] Playwright: sign up, log a workout, see it in Log

## Phase 7: Ship
- [ ] Confirm hosting, create projects
- [ ] Env vars set on the host
- [ ] Demo data and "Try the demo" button
- [ ] README
