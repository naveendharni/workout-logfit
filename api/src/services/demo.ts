import { randomBytes, randomUUID } from 'node:crypto';
import type { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../lib/db.js';
import { hashPassword } from '../lib/password.js';
import { deleteUsers } from './users.js';

const DEMO_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

type Lift = { slug: string; sets: number; reps: number; startKg: number; weeklyKg: number };

// A simple push / pull / legs split. Main lifts go up each week so the stats and records look like real progress.
const PROGRAM: Record<'push' | 'pull' | 'legs', Lift[]> = {
  push: [
    { slug: 'bench-press', sets: 4, reps: 6, startKg: 70, weeklyKg: 2.5 },
    { slug: 'overhead-press', sets: 3, reps: 8, startKg: 40, weeklyKg: 1.25 },
    { slug: 'incline-dumbbell-press', sets: 3, reps: 10, startKg: 24, weeklyKg: 1 },
    { slug: 'lateral-raise', sets: 3, reps: 12, startKg: 10, weeklyKg: 0 },
    { slug: 'tricep-pushdown', sets: 3, reps: 12, startKg: 25, weeklyKg: 1.25 },
  ],
  pull: [
    { slug: 'deadlift', sets: 3, reps: 5, startKg: 120, weeklyKg: 5 },
    { slug: 'pull-ups', sets: 3, reps: 8, startKg: 0, weeklyKg: 0 },
    { slug: 'barbell-row', sets: 4, reps: 8, startKg: 60, weeklyKg: 2.5 },
    { slug: 'face-pull', sets: 3, reps: 15, startKg: 20, weeklyKg: 0 },
    { slug: 'bicep-curl', sets: 3, reps: 10, startKg: 14, weeklyKg: 1 },
  ],
  legs: [
    { slug: 'squat', sets: 4, reps: 5, startKg: 100, weeklyKg: 5 },
    { slug: 'romanian-deadlift', sets: 3, reps: 8, startKg: 80, weeklyKg: 2.5 },
    { slug: 'leg-press', sets: 3, reps: 10, startKg: 160, weeklyKg: 10 },
    { slug: 'leg-curl', sets: 3, reps: 12, startKg: 40, weeklyKg: 2.5 },
    { slug: 'calf-raises', sets: 4, reps: 12, startKg: 60, weeklyKg: 2.5 },
  ],
};

// Training days counted back from today: 3 or 4 sessions a week for 4 weeks, rotating push, pull, legs.
const SESSION_DAYS_AGO = [27, 25, 23, 21, 20, 18, 16, 14, 13, 11, 9, 7, 6, 4, 2, 1];
const ROTATION = ['push', 'pull', 'legs'] as const;

const jitter = (n: number) => n + Math.floor(Math.random() * 3) - 1;

const buildWorkouts = (userId: string, exerciseIds: Map<string, string>): Prisma.WorkoutCreateInput[] => {
  const now = Date.now();
  return SESSION_DAYS_AGO.map((daysAgo, index) => {
    const day = ROTATION[index % ROTATION.length]!;
    const week = Math.floor((27 - daysAgo) / 7);
    const startedAt = new Date(now - daysAgo * DAY_MS);
    startedAt.setUTCHours(22, 0, 0, 0);
    const durationSec = 45 * 60 + Math.floor(Math.random() * 25 * 60);

    return {
      user: { connect: { id: userId } },
      clientId: `demo-${index}`,
      startedAt,
      endedAt: new Date(startedAt.getTime() + durationSec * 1000),
      durationSec,
      exercises: {
        create: PROGRAM[day].map((lift, position) => ({
          position,
          exercise: { connect: { id: exerciseIds.get(lift.slug)! } },
          sets: {
            create: Array.from({ length: lift.sets }, (_, setIndex) => ({
              position: setIndex,
              reps: Math.max(1, jitter(lift.reps) - (setIndex === lift.sets - 1 ? 1 : 0)),
              weightKg: lift.startKg + week * lift.weeklyKg,
              completed: true,
            })),
          },
        })),
      },
    };
  });
};

export const createDemoUser = async () => {
  // Housekeeping on the way in: old demo accounts (and, by cascade, their data) are removed.
  await deleteUsers({ isDemo: true, createdAt: { lt: new Date(Date.now() - DEMO_TTL_MS) } });

  const slugs = Object.values(PROGRAM).flat().map((l) => l.slug);
  const exercises = await prisma.exercise.findMany({ where: { slug: { in: slugs } }, select: { id: true, slug: true } });
  const exerciseIds = new Map(exercises.map((e) => [e.slug!, e.id]));
  if (exerciseIds.size !== new Set(slugs).size) throw new Error('Exercise seed is missing demo exercises');

  // A random password nobody knows: demo accounts can only be entered through the demo button.
  const user = await prisma.user.create({
    data: {
      email: `demo-${randomUUID().slice(0, 8)}@demo.logfit.io`,
      passwordHash: await hashPassword(randomBytes(32).toString('base64url')),
      isDemo: true,
    },
  });

  await prisma.$transaction(buildWorkouts(user.id, exerciseIds).map((data) => prisma.workout.create({ data })));
  return user;
};
