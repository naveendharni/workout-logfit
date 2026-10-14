import { z } from 'zod';
import type { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../lib/db.js';
import { HttpError } from '../lib/http-error.js';

const setInput = z.object({
  reps: z.number().int().min(0).max(1000),
  weightKg: z.number().min(0).max(2000),
  completed: z.boolean(),
});

const exerciseInput = z.object({
  exerciseId: z.uuid(),
  sets: z.array(setInput).max(50),
});

export const workoutInput = z.object({
  startedAt: z.iso.datetime(),
  durationSec: z.number().int().min(0).max(24 * 60 * 60),
  exercises: z.array(exerciseInput).min(1, 'Add at least one exercise').max(50),
});

export type WorkoutInput = z.infer<typeof workoutInput>;

// Everything the screens need for a workout in one query.
export const workoutInclude = {
  exercises: {
    orderBy: { position: 'asc' },
    include: {
      exercise: { select: { name: true, muscleGroup: true } },
      sets: { orderBy: { position: 'asc' } },
    },
  },
} satisfies Prisma.WorkoutInclude;

type WorkoutWithDetails = Prisma.WorkoutGetPayload<{ include: typeof workoutInclude }>;

// The shape the web app gets. Decimal weights become plain numbers, exercise names are inlined.
export const serializeWorkout = (workout: WorkoutWithDetails) => ({
  id: workout.id,
  clientId: workout.clientId,
  startedAt: workout.startedAt.toISOString(),
  durationSec: workout.durationSec,
  exercises: workout.exercises.map((entry) => ({
    id: entry.id,
    exerciseId: entry.exerciseId,
    exerciseName: entry.exercise.name,
    muscleGroup: entry.exercise.muscleGroup,
    sets: entry.sets.map((set) => ({
      id: set.id,
      reps: set.reps,
      weightKg: set.weightKg.toNumber(),
      completed: set.completed,
    })),
  })),
});

// A user can log built-in exercises and their own custom ones, never someone else's.
export const assertExercisesUsable = async (userId: string, exerciseIds: string[]) => {
  const unique = [...new Set(exerciseIds)];
  const found = await prisma.exercise.count({
    where: { id: { in: unique }, OR: [{ userId: null }, { userId }] },
  });
  if (found !== unique.length) throw new HttpError(400, 'Unknown exercise');
};

// Nested create data for a workout's exercises and sets, keeping their order.
export const nestedExercises = (exercises: WorkoutInput['exercises']) => ({
  create: exercises.map((entry, position) => ({
    position,
    exercise: { connect: { id: entry.exerciseId } },
    sets: {
      create: entry.sets.map((set, setPosition) => ({
        position: setPosition,
        reps: set.reps,
        weightKg: set.weightKg,
        completed: set.completed,
      })),
    },
  })),
});
