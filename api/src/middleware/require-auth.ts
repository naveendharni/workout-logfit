import type { Request, RequestHandler } from 'express';
import { HttpError } from '../lib/http-error.js';
import { verifyAccessToken } from '../lib/tokens.js';

// Protects a route: needs "Authorization: Bearer <access token>".
export const requireAuth: RequestHandler = async (req, _res, next) => {
  const header = req.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
  if (!token) throw new HttpError(401, 'Missing access token');
  req.userId = await verifyAccessToken(token);
  next();
};

export const getUserId = (req: Request): string => {
  if (!req.userId) throw new HttpError(401, 'Not authenticated');
  return req.userId;
};
