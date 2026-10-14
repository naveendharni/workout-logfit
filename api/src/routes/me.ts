import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db.js';
import { HttpError } from '../lib/http-error.js';
import { getUserId, requireAuth } from '../middleware/require-auth.js';

export const meRouter = Router();

meRouter.use(requireAuth);

const publicUser = { id: true, email: true, unit: true, isDemo: true } as const;

meRouter.get('/', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: getUserId(req) }, select: publicUser });
  if (!user) throw new HttpError(401, 'Not authenticated');
  res.json({ user });
});

const patchBody = z.object({ unit: z.enum(['KG', 'LB']) });

// Settings. The unit only changes how weights are shown and typed; stored weights are always kg.
meRouter.patch('/', async (req, res) => {
  const body = patchBody.parse(req.body);
  const user = await prisma.user.update({ where: { id: getUserId(req) }, data: body, select: publicUser });
  res.json({ user });
});
