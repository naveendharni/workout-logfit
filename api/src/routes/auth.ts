import { Router, type CookieOptions, type Response } from 'express';
import { z } from 'zod';
import { isProduction } from '../env.js';
import { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../lib/db.js';
import { HttpError } from '../lib/http-error.js';
import { hashPassword, verifyAgainstDummy, verifyPassword } from '../lib/password.js';
import { ACCESS_TOKEN_TTL_SEC, REFRESH_TOKEN_TTL_MS, signAccessToken } from '../lib/tokens.js';
import { demoLimiter, loginLimiter, refreshLimiter, signupLimiter } from '../middleware/rate-limit.js';
import { requireSameOrigin } from '../middleware/same-origin.js';
import { createDemoUser } from '../services/demo.js';
import { createSession, endSession, rotateSession } from '../services/session.js';

export const authRouter = Router();

export const REFRESH_COOKIE = 'logfit_rt';

const cookieOptions: CookieOptions = {
  httpOnly: true, // JavaScript can't read it, so an XSS bug can't steal it.
  secure: isProduction, // HTTPS only in production. Local dev runs on plain http://localhost.
  sameSite: 'strict', // Never sent on requests started by another site.
  path: '/api/auth', // Only sent to the auth routes, not with every API call.
};

const email = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email').max(254));

const signupBody = z.object({
  email,
  // Max length stops someone sending a huge string to make hashing slow.
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

const loginBody = z.object({
  email,
  password: z.string().min(1, 'Enter your password').max(128),
});

type PublicUser = { id: string; email: string; unit: 'KG' | 'LB'; isDemo: boolean };

const toPublicUser = (user: PublicUser): PublicUser => ({
  id: user.id,
  email: user.email,
  unit: user.unit,
  isDemo: user.isDemo,
});

// Every successful auth response has the same shape: a new access token in the body, a new refresh token in the cookie.
const sendSession = async (res: Response, user: PublicUser, refreshToken: string, status = 200) => {
  res.cookie(REFRESH_COOKIE, refreshToken, { ...cookieOptions, maxAge: REFRESH_TOKEN_TTL_MS });
  res.status(status).json({
    accessToken: await signAccessToken(user.id),
    expiresIn: ACCESS_TOKEN_TTL_SEC,
    user: toPublicUser(user),
  });
};

const clearRefreshCookie = (res: Response) => res.clearCookie(REFRESH_COOKIE, cookieOptions);

const readRefreshCookie = (cookies: unknown): string | undefined => {
  const value = (cookies as Record<string, unknown> | undefined)?.[REFRESH_COOKIE];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
};

authRouter.post('/signup', requireSameOrigin, signupLimiter, async (req, res) => {
  const body = signupBody.parse(req.body);
  const passwordHash = await hashPassword(body.password);

  let user;
  try {
    user = await prisma.user.create({ data: { email: body.email, passwordHash } });
  } catch (err) {
    // Unique constraint on email. Checking first and then inserting would race; letting the database decide doesn't.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new HttpError(409, 'An account with this email already exists');
    }
    throw err;
  }

  await sendSession(res, user, await createSession(user.id), 201);
});

authRouter.post('/login', requireSameOrigin, loginLimiter, async (req, res) => {
  const body = loginBody.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: body.email } });

  const valid = user ? await verifyPassword(user.passwordHash, body.password) : await verifyAgainstDummy(body.password);
  // Same message for "no such email" and "wrong password", so the response doesn't reveal which emails exist.
  if (!user || !valid) throw new HttpError(401, 'Invalid email or password');

  await sendSession(res, user, await createSession(user.id));
});

// "Try the demo": a fresh throwaway account with a few weeks of workouts, logged in straight away.
// Each visitor gets their own copy, so nobody can wreck the demo for the next person.
authRouter.post('/demo', requireSameOrigin, demoLimiter, async (_req, res) => {
  const user = await createDemoUser();
  await sendSession(res, user, await createSession(user.id), 201);
});

authRouter.post('/refresh', requireSameOrigin, refreshLimiter, async (req, res) => {
  const token = readRefreshCookie(req.cookies);
  if (!token) throw new HttpError(401, 'No session');

  try {
    const rotated = await rotateSession(token);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: rotated.userId } });
    await sendSession(res, user, rotated.token);
  } catch (err) {
    // Only a dead session clears the cookie. A 409 (lost a race) must leave the browser's newer cookie alone.
    if (err instanceof HttpError && err.status === 401) clearRefreshCookie(res);
    throw err;
  }
});

authRouter.post('/logout', requireSameOrigin, async (req, res) => {
  const token = readRefreshCookie(req.cookies);
  if (token) await endSession(token);
  clearRefreshCookie(res);
  res.status(204).end();
});
