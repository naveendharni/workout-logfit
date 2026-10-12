# logfit.io plan

Turn logfit.io from a browser-only prototype into a real, usable app for my portfolio. I'm a senior full-stack engineer (React, TypeScript, Node, SQL). I want it done properly without wasting time, and I must be able to explain every decision in an interview.

## Where it is today
- Vite + React 19 + TypeScript + Tailwind v4 + React Router. Dark UI with a lime accent. Keep this look, don't redesign it.
- Screens: Home, Lift (active session with rest timer), Log (history), Stats.
- All data is in localStorage. No backend, no database, no login.
- 31 exercises in src/data/exercises.ts. The README is still the Vite template.

## What "done" means
A stranger opens the live link on their phone, signs up (or taps "Try the demo"), logs a workout with sets, sees it in Log and Stats, installs the app to their home screen, and finds their data on another device after logging in.

## Stack (ask before changing any of this)
- npm workspaces: web/ (the current Vite app, moved) and api/ (new).
- api: Node.js, Express, TypeScript, zod for validation, Prisma with PostgreSQL. Local Postgres through docker-compose.yml.
- Auth with JWT, done properly:
  - Passwords hashed with argon2id (bcrypt if argon2 causes trouble on the host).
  - Short-lived access token (about 15 minutes), kept in memory on the client, never in localStorage.
  - Refresh token in an httpOnly, Secure, SameSite cookie, rotated on every refresh, stored hashed in the database so logout and reuse detection work.
  - Rate limiting on auth routes, CORS locked to the web app, helmet.
  - Serve the API on the same domain as the web app (for example under /api) so the cookie is first-party. Safari blocks cross-site cookies.
- Hosting must be free and must not be Netlify (its credits are shared with my portfolio). Suggest the best current free option for the web app, API and Postgres (for example Vercel plus Neon), check current docs, and confirm with me before creating anything.

## Phases (stop after each one, explain what you built in plain words, let me test it)
1. Plan. Read the code. Save this brief as docs/PLAN.md, create docs/PROGRESS.md with a checklist, and a short working-rules file with the "How to work with me" rules below. Tell me if anything in this brief is a bad idea before starting.
2. Backend foundation. Move the app into web/, add api/, Docker Postgres, Prisma schema (users, exercises, workouts, workout exercises, sets, refresh tokens), migrations, and a seed with about 80 common exercises, each with a muscle group and equipment. One command starts everything locally.
3. Auth. Sign up, log in, log out and refresh on the API. Sign-up and log-in screens in the app's style, protected routes, silent token refresh. Then walk me through the full token flow so I can explain it.
4. Workouts. CRUD for workouts, exercises and sets through the API, replacing localStorage everywhere. Exercise picker with search, muscle group and equipment filters, and custom exercises. A kg/lb setting. On first login, offer to import workouts already saved in this browser. Loading, empty and error states on every screen.
5. Phone. Installable PWA (manifest, icons, service worker) so it works like an app on iOS and Android. Mobile polish and an accessibility pass: labels, keyboard, focus, contrast.
6. Tests. API tests for auth and workouts (Vitest and Supertest), plus one Playwright test: sign up, log a workout, see it in Log.
7. Ship. Deploy, set env vars, seed a demo account with a few weeks of realistic workouts behind a "Try the demo" button, and write a real README: screenshots, what it does, architecture, API routes, how auth works, key decisions and trade-offs, how to run it locally.

## How to work with me
- Short, plain explanations. Numbered steps. No em dashes.
- Don't commit or push, I do that myself. No AI attribution anywhere.
- Never put secrets in code or git: .env files (gitignored) plus .env.example. Never print credentials, tokens or connection strings.
- Check current docs before using framework APIs (Prisma, Express, the PWA plugin, the host). Don't guess from memory.
- Run lint, type checks and tests before saying something works, and show me the output.
- Keep docs/PROGRESS.md current so a new session can pick up where we left off.

## Choices already made
- Login security: in-memory access token plus rotating refresh cookie.
- Demo account: the "Try the demo" button matters most. Recruiters won't sign up, but they will tap a demo.
- Hosting: Netlify is ruled out to protect the portfolio site's credits.
