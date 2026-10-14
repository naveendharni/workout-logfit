export type Unit = 'KG' | 'LB';

export type MuscleGroup =
  | 'CHEST' | 'BACK' | 'SHOULDERS' | 'BICEPS' | 'TRICEPS' | 'FOREARMS'
  | 'QUADS' | 'HAMSTRINGS' | 'GLUTES' | 'CALVES' | 'CORE' | 'FULL_BODY';

export type Equipment =
  | 'BARBELL' | 'DUMBBELL' | 'MACHINE' | 'CABLE' | 'BODYWEIGHT'
  | 'KETTLEBELL' | 'BAND' | 'SMITH_MACHINE' | 'EZ_BAR' | 'OTHER';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  isCustom: boolean;
}

// Weights are always kg in data. The user's unit only affects display and input.
export interface WorkoutSet {
  id: string;
  reps: number;
  weightKg: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  clientId: string | null;
  startedAt: string;
  durationSec: number;
  exercises: WorkoutExercise[];
}

// The in-progress workout, kept on the device until Finish. serverId is set when editing a saved workout.
export interface Draft {
  clientId: string;
  serverId: string | null;
  startedAt: string;
  durationSec: number;
  exercises: WorkoutExercise[];
}

export interface Stats {
  totalWorkouts: number;
  thisWeekWorkouts: number;
  totalExercises: number;
  totalSets: number;
  totalVolumeKg: number;
  days: { date: string; volumeKg: number; workouts: number }[];
  personalRecords: { exercise: string; weightKg: number; reps: number }[];
}
