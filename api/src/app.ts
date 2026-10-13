import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './env.js';
import { errorHandler, notFound } from './middleware/error-handler.js';
import { authRouter } from './routes/auth.js';
import { healthRouter } from './routes/health.js';

export const app = express();

app.disable('x-powered-by');
// Number of proxies in front of us, so req.ip is the real client IP (used by rate limiting).
app.set('trust proxy', env.TRUST_PROXY);
app.use(helmet());
// The web app calls /api on its own origin, so this only matters for other origins, which are refused.
app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);

app.use('/api', notFound);
app.use(errorHandler);

export default app;
