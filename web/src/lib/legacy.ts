// Workouts saved by the browser-only version of the app, before accounts existed.
const LEGACY_WORKOUTS_KEY = 'workout-app-workouts';
const LEGACY_CURRENT_KEY = 'workout-app-current';

type LegacyWorkout = { id: string; completed?: boolean; exercises?: unknown[] };

export const readLegacyWorkouts = (): LegacyWorkout[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(LEGACY_WORKOUTS_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((w: LegacyWorkout) => w?.completed !== false && (w?.exercises?.length ?? 0) > 0);
  } catch {
    return [];
  }
};

// Once imported, the local copy is removed so it isn't offered again, or to another account on this browser.
export const clearLegacyWorkouts = () => {
  localStorage.removeItem(LEGACY_WORKOUTS_KEY);
  localStorage.removeItem(LEGACY_CURRENT_KEY);
};

const dismissedKey = (userId: string) => `logfit:import-dismissed:${userId}`;

export const isImportDismissed = (userId: string) => localStorage.getItem(dismissedKey(userId)) === '1';

export const dismissImport = (userId: string) => localStorage.setItem(dismissedKey(userId), '1');
