import { createHash, randomBytes } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import { env } from '../env.js';
import { HttpError } from './http-error.js';

const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const ALG = 'HS256';
const ISSUER = 'logfit-api';
const AUDIENCE = 'logfit-web';

export const ACCESS_TOKEN_TTL_SEC = 15 * 60;
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const signAccessToken = (userId: string) =>
  new SignJWT({})
    .setProtectedHeader({ alg: ALG })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SEC}s`)
    .sign(secret);

export const verifyAccessToken = async (token: string): Promise<string> => {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [ALG],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (!payload.sub) throw new Error('Missing subject');
    return payload.sub;
  } catch {
    throw new HttpError(401, 'Invalid or expired access token');
  }
};

// Refresh tokens are 256 random bits, not JWTs. They mean nothing on their own and are only valid if the database says so.
export const generateRefreshToken = () => randomBytes(32).toString('base64url');

// SHA-256 is enough here (unlike passwords) because the input is already high-entropy random data,
// and a fast deterministic hash lets us look the token up by an indexed column.
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
