import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.url(),
  WEB_ORIGIN: z.url().default('http://localhost:5173'),
  JWT_ACCESS_SECRET: z.string().min(32),
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // Only report which variables are wrong, never their values.
  const fields = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ');
  throw new Error(`Invalid or missing environment variables: ${fields}`);
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === 'production';
