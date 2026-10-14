# logfit.io

A mobile-first workout tracker. Log your sets, reps and weights during a session, use the built-in rest timer, and review your history and progress over time. Your account keeps your workouts in sync on every device.

> **Status:** in active development. Accounts, workouts in the database, stats and the demo all work locally. The installable phone app, automated tests and the live deployment are next (see [Roadmap](#roadmap)).

## Features

**Working now**
- **Try the demo**: one tap, no sign-up, comes with 4 weeks of sample workouts
- Sign up, log in and log out, with sessions that survive a page reload
- Log workouts with sets, reps and weight; your workouts sync across devices
- Exercise picker with search, muscle group and equipment filters, plus your own custom exercises
- kg / lb setting
- Edit or delete past workouts in the Log
- Stats: weekly volume chart, totals and personal records
- Rest timer with 30, 60, 90 and 120 second presets
- Works with bad gym signal: the workout in progress is kept on the device until it's saved
- One-tap import of workouts saved in the browser before you had an account

**Coming next**
- Installable on iOS and Android home screens (PWA)
- Accessibility and mobile polish pass
- Automated tests and a live deployment

## Tech stack

| Layer | Tools |
|---|---|
| Web app | React 19, TypeScript, Vite, Tailwind CSS v4, React Router |
| API | Node.js, Express 5, TypeScript, zod |
| Database | PostgreSQL, Prisma ORM |
| Auth | argon2id password hashing, JWT access tokens (jose), rotating refresh tokens in an httpOnly cookie |
| Security | helmet, CORS allow-list, Origin check, Postgres-backed rate limiting |
| Local dev | npm workspaces, Docker Compose |

## Architecture

```
Browser (React app)
   │  same origin: /api/*
   ▼
Express API ──► Prisma ──► PostgreSQL
```

- The web app and the API are served from the same domain, with the API under `/api`. That keeps the login cookie first-party, which matters because Safari blocks third-party cookies.
- In development, Vite proxies `/api` to the API on port 4000, so local setup behaves like production.

## How login works

1. Passwords are hashed with **argon2id**. Plain passwords are never stored.
2. Logging in returns a short-lived **access token** (15 minutes). The app keeps it in memory only, never in localStorage.
3. A long-lived **refresh token** is set in an **httpOnly, SameSite=Strict cookie** that JavaScript can't read. The database stores only a SHA-256 hash of it.
4. When the access token expires, or the page reloads, the app quietly swaps the refresh token for a new pair. Each refresh token works once (**rotation**).
5. If an old refresh token is ever reused, the server treats it as possible theft and ends that whole session (**reuse detection**).
6. Login, sign-up and refresh are **rate limited** per IP.

## API

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | none | API and database status |
| POST | `/api/auth/signup` | none | Create an account, start a session |
| POST | `/api/auth/login` | none | Log in, start a session |
| POST | `/api/auth/demo` | none | Start a throwaway demo account |
| POST | `/api/auth/refresh` | refresh cookie | Get a new access token, rotate the refresh token |
| POST | `/api/auth/logout` | refresh cookie | End this device's session |
| GET, PATCH | `/api/me` | access token | Current user, change kg/lb |
| GET, POST | `/api/exercises` | access token | List exercises, create a custom one |
| DELETE | `/api/exercises/:id` | access token | Delete a custom exercise |
| GET, POST | `/api/workouts` | access token | List (paged), save a new workout |
| GET, PUT, DELETE | `/api/workouts/:id` | access token | Read, replace or delete a workout |
| POST | `/api/workouts/import` | access token | Import workouts from the old browser-only app |
| GET | `/api/stats` | access token | Totals, last 7 days, personal records |

## Run it locally

**Requirements:** Node.js 22+, Docker.

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Create the env files from the templates and fill in the values:
   ```bash
   cp .env.example .env
   cp api/.env.example api/.env
   ```
   - Use the same database password in both files.
   - Set `JWT_ACCESS_SECRET` to a long random string, for example the output of `openssl rand -base64 48`.
3. Start everything:
   ```bash
   npm run dev
   ```
   This starts Postgres in Docker, applies the database migrations, loads the exercise list, and runs the API and the web app.
4. Open http://localhost:5173 and create an account.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start database, API and web app |
| `npm run lint` | Lint both workspaces |
| `npm run typecheck` | Type check both workspaces |
| `npm run build` | Production build of both workspaces |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:seed` | Load the built-in exercises (safe to rerun) |
| `npm run db:reset` | Wipe the local database and start fresh |
| `npm run db:down` | Stop the database container |

## Project structure

```
api/              Express API
  prisma/         Database schema, migrations, exercise seed data
  src/routes/     HTTP routes (auth, me, exercises, workouts, stats)
  src/services/   Business logic (sessions, workouts, demo data)
  src/middleware/ Auth, rate limiting, Origin check, error handling
  src/lib/        Database client, password hashing, tokens
web/              React app
  src/pages/      Screens (Home, Lift, Log, Stats, Log in, Sign up)
  src/components/ Exercise picker, set rows, import banner, demo button
  src/auth/       Login state and protected routes
  src/lib/        API client, kg/lb units, workout draft
```

## Roadmap

- [x] API, database and seed data
- [x] Accounts and secure login
- [x] Workouts saved to the database, exercise picker, kg/lb, import, demo
- [ ] Installable phone app and accessibility pass
- [ ] Automated tests (API and end-to-end)
- [ ] Live deployment
