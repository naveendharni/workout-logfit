import { z } from 'zod';
import { HttpError } from './http-error.js';

// Route ids are UUIDs. Anything else can't exist, so it's a 404 rather than a database error.
export const parseId = (value: unknown): string => {
  const result = z.uuid().safeParse(value);
  if (!result.success) throw new HttpError(404, 'Not found');
  return result.data;
};
