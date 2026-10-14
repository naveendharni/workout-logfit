import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './env.js';
import { errorHandler, notFound } from './middleware/error-handler.js';
import { authRouter } from './routes/auth.js';
import { exercisesRouter } from './routes/exercises.js';
import { healthRouter } from './routes/health.js';
import { meRouter } from './routes/me.js';
import { statsRouter } from './routes/stats.js';
import { workoutsRouter } from './routes/workouts.js';

export const app = express();

app.disable('x-powered-by');
// Number of proxies in front of us, so req.ip is the real client IP (used by rate limiting).
app.set('trust proxy', env.TRUST_PROXY);
app.use(helmet());
// The web app calls /api on its own origin, so this only matters for other origins, which are refused.
app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
// Importing a whole browser history can be large, so that one route gets a bigger body limit.
// It runs first; the general parser then sees the body is already parsed and skips it.
app.use('/api/workouts/import', express.json({ limit: '2mb' }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/me', meRouter);
app.use('/api/exercises', exercisesRouter);
app.use('/api/workouts', workoutsRouter);
app.use('/api/stats', statsRouter);

app.use('/api', notFound);
app.use(errorHandler);

export default app;
