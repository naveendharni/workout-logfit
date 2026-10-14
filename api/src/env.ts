import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.url(),
  WEB_ORIGIN: z.url().default('http://localhost:5173'),
  JWT_ACCESS_SECRET: z.string().min(32),
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  // Set by Vercel on every deployment. Not set locally.
  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // Only report which variables are wrong, never their values.
  const fields = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ');
  throw new Error(`Invalid or missing environment variables: ${fields}`);
}

export const env = parsed.data;

// Deployed (Vercel production or preview) counts as production: both run over HTTPS.
// NODE_ENV isn't relied on alone because setting it on Vercel would also skip devDependencies at build time.
export const isProduction =
  env.NODE_ENV === 'production' || env.VERCEL_ENV === 'production' || env.VERCEL_ENV === 'preview';
