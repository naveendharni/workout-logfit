import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../lib/db.js';
import { HttpError } from '../lib/http-error.js';
import { parseId } from '../lib/validation.js';
import { getUserId, requireAuth } from '../middleware/require-auth.js';
import {
  assertExercisesUsable,
  nestedExercises,
  serializeWorkout,
  workoutInclude,
  workoutInput,
} from '../services/workouts.js';

export const workoutsRouter = Router();

workoutsRouter.use(requireAuth);

const listQuery = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.uuid().optional(),
});

// Newest first, paged with a cursor (the last id of the previous page) so pages stay stable while new workouts are added.
workoutsRouter.get('/', async (req, res) => {
  const { limit, cursor } = listQuery.parse(req.query);
  const rows = await prisma.workout.findMany({
    where: { userId: getUserId(req) },
    orderBy: [{ startedAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: workoutInclude,
  });
  const page = rows.slice(0, limit);
  res.json({
    workouts: page.map(serializeWorkout),
    nextCursor: rows.length > limit ? (page.at(-1)?.id ?? null) : null,
  });
});

// Every lookup is scoped to the user. Someone else's workout gives 404, not 403, so ids can't be probed.
const findOwned = async (userId: string, id: string) => {
  const workout = await prisma.workout.findFirst({ where: { id, userId }, include: workoutInclude });
  if (!workout) throw new HttpError(404, 'Workout not found');
  return workout;
};

workoutsRouter.get('/:id', async (req, res) => {
  const workout = await findOwned(getUserId(req), parseId(req.params.id));
  res.json({ workout: serializeWorkout(workout) });
});

const createBody = workoutInput.extend({
  // Id the device generated for this workout. Saving twice with the same clientId returns the first save.
  clientId: z.string().min(1).max(100),
});

workoutsRouter.post('/', async (req, res) => {
  const userId = getUserId(req);
  const body = createBody.parse(req.body);

  const existing = await prisma.workout.findUnique({
    where: { userId_clientId: { userId, clientId: body.clientId } },
    include: workoutInclude,
  });
  if (existing) {
    res.status(200).json({ workout: serializeWorkout(existing) });
    return;
  }

  await assertExercisesUsable(userId, body.exercises.map((e) => e.exerciseId));

  try {
    // One nested create, so the workout, its exercises and sets are saved together or not at all.
    const workout = await prisma.workout.create({
      data: {
        user: { connect: { id: userId } },
        clientId: body.clientId,
        startedAt: new Date(body.startedAt),
        endedAt: new Date(),
        durationSec: body.durationSec,
        exercises: nestedExercises(body.exercises),
      },
      include: workoutInclude,
    });
    res.status(201).json({ workout: serializeWorkout(workout) });
  } catch (err) {
    // Two identical saves raced past the check above. The database's unique key let one win; return it.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const winner = await prisma.workout.findUniqueOrThrow({
        where: { userId_clientId: { userId, clientId: body.clientId } },
        include: workoutInclude,
      });
      res.status(200).json({ workout: serializeWorkout(winner) });
      return;
    }
    throw err;
  }
});

// Editing replaces the workout's exercises and sets as a whole. The workout is the unit the user edits,
// and replacing in one transaction is simpler and safer than diffing individual sets.
workoutsRouter.put('/:id', async (req, res) => {
  const userId = getUserId(req);
  const id = parseId(req.params.id);
  const body = workoutInput.parse(req.body);
  await findOwned(userId, id);
  await assertExercisesUsable(userId, body.exercises.map((e) => e.exerciseId));

  const workout = await prisma.$transaction(async (tx) => {
    await tx.workoutExercise.deleteMany({ where: { workoutId: id } });
    return tx.workout.update({
      where: { id },
      data: {
        startedAt: new Date(body.startedAt),
        durationSec: body.durationSec,
        exercises: nestedExercises(body.exercises),
      },
      include: workoutInclude,
    });
  });
  res.json({ workout: serializeWorkout(workout) });
});

workoutsRouter.delete('/:id', async (req, res) => {
  const userId = getUserId(req);
  const id = parseId(req.params.id);
  // deleteMany with the user in the filter: deletes only if it's theirs, in one query.
  const { count } = await prisma.workout.deleteMany({ where: { id, userId } });
  if (count === 0) throw new HttpError(404, 'Workout not found');
  res.status(204).end();
});

// Workouts saved by the old browser-only version of the app.
const legacyWorkout = z.object({
  id: z.string().min(1).max(100),
  date: z.iso.datetime({ offset: true }),
  duration: z.number().min(0).max(24 * 60 * 60).optional(),
  completed: z.boolean().optional(),
  exercises: z
    .array(
      z.object({
        exerciseId: z.string().max(100),
        exerciseName: z.string().trim().min(1).max(100),
        sets: z
          .array(z.object({ reps: z.number().min(0).max(1000), weight: z.number().min(0).max(5000), completed: z.boolean() }))
          .max(50),
      }),
    )
    .max(50),
});

const importBody = z.object({ workouts: z.array(legacyWorkout).max(1000) });

const KG_PER_LB = 0.45359237;

workoutsRouter.post('/import', async (req, res) => {
  const userId = getUserId(req);
  const { workouts } = importBody.parse(req.body);
  const toImport = workouts.filter((w) => w.completed !== false && w.exercises.length > 0);

  // Old exercise ids were slugs like "bench-press". The seed kept them, so most map directly.
  const visible = await prisma.exercise.findMany({
    where: { OR: [{ userId: null }, { userId }] },
    select: { id: true, slug: true, name: true },
  });
  const bySlug = new Map(visible.filter((e) => e.slug).map((e) => [e.slug as string, e.id]));
  const byName = new Map(visible.map((e) => [e.name.toLowerCase(), e.id]));

  const resolveExercise = async (slug: string, name: string) => {
    const known = bySlug.get(slug) ?? byName.get(name.toLowerCase());
    if (known) return known;
    // Not in the catalogue any more: keep the history by creating it as the user's custom exercise.
    const created = await prisma.exercise.create({
      data: { name, muscleGroup: 'FULL_BODY', equipment: 'OTHER', userId },
    });
    byName.set(name.toLowerCase(), created.id);
    return created.id;
  };

  let imported = 0;
  let skipped = 0;
  for (const legacy of toImport) {
    // clientId is the old local id, so importing the same browser data twice adds nothing the second time.
    const exists = await prisma.workout.findUnique({
      where: { userId_clientId: { userId, clientId: legacy.id } },
      select: { id: true },
    });
    if (exists) {
      skipped++;
      continue;
    }

    const exercises = [];
    for (const entry of legacy.exercises) {
      exercises.push({
        exerciseId: await resolveExercise(entry.exerciseId, entry.exerciseName),
        sets: entry.sets.map((set) => ({
          reps: Math.round(set.reps),
          // The old app logged pounds. Store kg rounded to the column's 3 decimals.
          weightKg: Math.round(set.weight * KG_PER_LB * 1000) / 1000,
          completed: set.completed,
        })),
      });
    }

    const startedAt = new Date(legacy.date);
    await prisma.workout.create({
      data: {
        user: { connect: { id: userId } },
        clientId: legacy.id,
        startedAt,
        endedAt: new Date(startedAt.getTime() + (legacy.duration ?? 0) * 1000),
        durationSec: Math.round(legacy.duration ?? 0),
        exercises: nestedExercises(exercises),
      },
    });
    imported++;
  }

  res.json({ imported, skipped });
});
