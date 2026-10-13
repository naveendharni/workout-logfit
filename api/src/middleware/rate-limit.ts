import { rateLimit } from 'express-rate-limit';
import { PostgresStore } from '../lib/rate-limit-store.js';

const MINUTE = 60 * 1000;

const limiter = (prefix: string, windowMs: number, limit: number, skipSuccessfulRequests = false) =>
  rateLimit({
    windowMs,
    limit,
    skipSuccessfulRequests,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    store: new PostgresStore(prefix),
    message: { error: 'Too many attempts. Please wait a few minutes and try again.' },
  });

// Only failed logins count, so a user who logs in fine is never blocked.
export const loginLimiter = limiter('login:', 15 * MINUTE, 10, true);
export const signupLimiter = limiter('signup:', 60 * MINUTE, 5);
export const refreshLimiter = limiter('refresh:', 15 * MINUTE, 60);
