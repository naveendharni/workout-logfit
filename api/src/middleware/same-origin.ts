import type { RequestHandler } from 'express';
import { env } from '../env.js';
import { HttpError } from '../lib/http-error.js';

// CSRF defence for routes that act on the refresh cookie. SameSite=Strict already stops other sites
// from sending the cookie; this is a second layer. Browsers always send Origin on a cross-origin POST,
// so a request from any other site is refused. Requests with no Origin (curl, tests) are not from a browser
// page and can't carry a victim's cookie, so they're allowed.
export const requireSameOrigin: RequestHandler = (req, _res, next) => {
  const origin = req.get('origin');
  if (origin && origin !== env.WEB_ORIGIN) throw new HttpError(403, 'Origin not allowed');
  next();
};
