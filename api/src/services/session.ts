import { randomUUID } from 'node:crypto';
import { prisma } from '../lib/db.js';
import { HttpError } from '../lib/http-error.js';
import { REFRESH_TOKEN_TTL_MS, generateRefreshToken, hashToken } from '../lib/tokens.js';

// If a token that was rotated within this window is used again, it's almost certainly two requests
// from the same browser racing (two tabs, React StrictMode), not theft. Answer 409 instead of 401:
// the browser already holds the newer cookie from the winning request, so the client just retries,
// and the route must not clear the cookie (that would delete the newer one).
const ROTATION_GRACE_MS = 10 * 1000;

const expiresAt = () => new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

// Starts a new session (a new token family) at sign-up or log-in. Returns the raw token for the cookie.
export const createSession = async (userId: string) => {
  const token = generateRefreshToken();
  await prisma.refreshToken.create({
    data: { userId, tokenHash: hashToken(token), familyId: randomUUID(), expiresAt: expiresAt() },
  });
  return token;
};

const revokeFamily = (familyId: string) =>
  prisma.refreshToken.updateMany({
    where: { familyId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

// Swaps a valid refresh token for a new one. Each token works exactly once.
export const rotateSession = async (token: string) => {
  const current = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!current) throw new HttpError(401, 'Invalid refresh token');

  if (current.revokedAt) {
    const recentlyRotated =
      current.replacedBy !== null && Date.now() - current.revokedAt.getTime() < ROTATION_GRACE_MS;
    // Reuse of an old token outside the grace window means someone else may have a copy.
    // Revoke the whole family so both the thief and the real user have to log in again.
    if (recentlyRotated) throw new HttpError(409, 'Refresh token was just rotated, retry');
    await revokeFamily(current.familyId);
    throw new HttpError(401, 'Refresh token already used');
  }

  if (current.expiresAt <= new Date()) throw new HttpError(401, 'Refresh token expired');

  const next = generateRefreshToken();
  const nextId = randomUUID();

  await prisma.$transaction(async (tx) => {
    // Conditional update so only one of two concurrent requests can claim this token.
    const claimed = await tx.refreshToken.updateMany({
      where: { id: current.id, revokedAt: null },
      data: { revokedAt: new Date(), replacedBy: nextId },
    });
    if (claimed.count === 0) throw new HttpError(409, 'Refresh token was just rotated, retry');

    await tx.refreshToken.create({
      data: {
        id: nextId,
        userId: current.userId,
        tokenHash: hashToken(next),
        familyId: current.familyId,
        expiresAt: expiresAt(),
      },
    });
  });

  return { token: next, userId: current.userId };
};

// Logout ends this device's session only (its family), not the user's other devices.
export const endSession = async (token: string) => {
  const current = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (current) await revokeFamily(current.familyId);
};
