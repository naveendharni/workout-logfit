import { Router } from 'express';
import { z } from 'zod';
import { Equipment, MuscleGroup } from '../generated/prisma/enums.js';
import { prisma } from '../lib/db.js';
import { HttpError } from '../lib/http-error.js';
import { parseId } from '../lib/validation.js';
import { getUserId, requireAuth } from '../middleware/require-auth.js';

export const exercisesRouter = Router();

exercisesRouter.use(requireAuth);

const select = { id: true, name: true, muscleGroup: true, equipment: true, userId: true } as const;

const serialize = (e: { id: string; name: string; muscleGroup: MuscleGroup; equipment: Equipment; userId: string | null }) => ({
  id: e.id,
  name: e.name,
  muscleGroup: e.muscleGroup,
  equipment: e.equipment,
  isCustom: e.userId !== null,
});

// The full list is about 90 rows, so the app gets it in one request and filters on the device.
// Search then responds instantly on every keystroke, with no request per letter.
exercisesRouter.get('/', async (req, res) => {
  const exercises = await prisma.exercise.findMany({
    where: { OR: [{ userId: null }, { userId: getUserId(req) }] },
    orderBy: { name: 'asc' },
    select,
  });
  res.json({ exercises: exercises.map(serialize) });
});

const createBody = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  muscleGroup: z.enum(MuscleGroup),
  equipment: z.enum(Equipment),
});

exercisesRouter.post('/', async (req, res) => {
  const userId = getUserId(req);
  const body = createBody.parse(req.body);

  const clash = await prisma.exercise.findFirst({
    where: { name: { equals: body.name, mode: 'insensitive' }, OR: [{ userId: null }, { userId }] },
    select: { id: true },
  });
  if (clash) throw new HttpError(409, 'An exercise with this name already exists');

  const exercise = await prisma.exercise.create({ data: { ...body, userId }, select });
  res.status(201).json({ exercise: serialize(exercise) });
});

exercisesRouter.delete('/:id', async (req, res) => {
  const userId = getUserId(req);
  const id = parseId(req.params.id);
  // Only the owner's custom exercises. Built-in ones have no userId, so they never match.
  const exercise = await prisma.exercise.findFirst({ where: { id, userId }, select: { id: true } });
  if (!exercise) throw new HttpError(404, 'Exercise not found');

  const used = await prisma.workoutExercise.count({ where: { exerciseId: id } });
  if (used > 0) throw new HttpError(409, 'This exercise is used in your workout history and can’t be deleted');

  await prisma.exercise.delete({ where: { id } });
  res.status(204).end();
});
