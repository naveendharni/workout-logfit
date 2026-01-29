import type { Workout, WorkoutStats } from '../types';

const WORKOUTS_KEY = 'workout-app-workouts';
const CURRENT_WORKOUT_KEY = 'workout-app-current';

export const saveWorkouts = (workouts: Workout[]): void => {
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
};

export const loadWorkouts = (): Workout[] => {
  const data = localStorage.getItem(WORKOUTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveCurrentWorkout = (workout: Workout | null): void => {
  if (workout) {
    localStorage.setItem(CURRENT_WORKOUT_KEY, JSON.stringify(workout));
  } else {
    localStorage.removeItem(CURRENT_WORKOUT_KEY);
  }
};

export const loadCurrentWorkout = (): Workout | null => {
  const data = localStorage.getItem(CURRENT_WORKOUT_KEY);
  return data ? JSON.parse(data) : null;
};

export const calculateStats = (workouts: Workout[]): WorkoutStats => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  let totalVolume = 0;
  let totalSets = 0;
  let totalReps = 0;
  let thisWeekWorkouts = 0;

  workouts.forEach(workout => {
    if (!workout.completed) return;

    const workoutDate = new Date(workout.date);
    if (workoutDate >= weekAgo) {
      thisWeekWorkouts++;
    }

    workout.exercises.forEach(exercise => {
      exercise.sets.forEach(set => {
        if (set.completed) {
          totalSets++;
          totalReps += set.reps;
          totalVolume += set.reps * set.weight;
        }
      });
    });
  });

  return {
    totalWorkouts: workouts.filter(w => w.completed).length,
    totalVolume,
    totalSets,
    totalReps,
    thisWeekWorkouts,
  };
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
