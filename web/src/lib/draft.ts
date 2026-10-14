import type { Draft, Workout } from '../types';

// Drafts are per user, so two accounts on one browser never see each other's unfinished workout.
export const draftKey = (userId: string) => `logfit:draft:${userId}`;

export const newDraft = (): Draft => ({
  clientId: crypto.randomUUID(),
  serverId: null,
  startedAt: new Date().toISOString(),
  durationSec: 0,
  exercises: [],
});

export const readDraft = (userId: string): Draft | null => {
  try {
    const raw = localStorage.getItem(draftKey(userId));
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
};

export const writeDraft = (userId: string, draft: Draft) => {
  localStorage.setItem(draftKey(userId), JSON.stringify(draft));
};

// Opening a saved workout for editing turns it back into a draft that remembers its server id.
export const draftFromWorkout = (workout: Workout): Draft => ({
  clientId: workout.clientId ?? crypto.randomUUID(),
  serverId: workout.id,
  startedAt: workout.startedAt,
  durationSec: workout.durationSec,
  exercises: workout.exercises.map((e) => ({ ...e, sets: e.sets.map((s) => ({ ...s })) })),
});

export const toWorkoutBody = (draft: Draft, durationSec: number) => ({
  startedAt: draft.startedAt,
  durationSec,
  exercises: draft.exercises.map((e) => ({
    exerciseId: e.exerciseId,
    sets: e.sets.map(({ reps, weightKg, completed }) => ({ reps, weightKg, completed })),
  })),
});
