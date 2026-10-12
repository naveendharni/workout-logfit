import type { Exercise } from '../types';

export const exercises: Exercise[] = [
  // Chest
  { id: 'bench-press', name: 'Bench Press', category: 'chest' },
  { id: 'incline-bench', name: 'Incline Bench Press', category: 'chest' },
  { id: 'dumbbell-fly', name: 'Dumbbell Fly', category: 'chest' },
  { id: 'push-ups', name: 'Push Ups', category: 'chest' },
  { id: 'cable-crossover', name: 'Cable Crossover', category: 'chest' },

  // Back
  { id: 'deadlift', name: 'Deadlift', category: 'back' },
  { id: 'pull-ups', name: 'Pull Ups', category: 'back' },
  { id: 'barbell-row', name: 'Barbell Row', category: 'back' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', category: 'back' },
  { id: 'seated-row', name: 'Seated Cable Row', category: 'back' },

  // Legs
  { id: 'squat', name: 'Squat', category: 'legs' },
  { id: 'leg-press', name: 'Leg Press', category: 'legs' },
  { id: 'lunges', name: 'Lunges', category: 'legs' },
  { id: 'leg-curl', name: 'Leg Curl', category: 'legs' },
  { id: 'leg-extension', name: 'Leg Extension', category: 'legs' },
  { id: 'calf-raises', name: 'Calf Raises', category: 'legs' },

  // Shoulders
  { id: 'overhead-press', name: 'Overhead Press', category: 'shoulders' },
  { id: 'lateral-raise', name: 'Lateral Raise', category: 'shoulders' },
  { id: 'front-raise', name: 'Front Raise', category: 'shoulders' },
  { id: 'face-pull', name: 'Face Pull', category: 'shoulders' },
  { id: 'shrugs', name: 'Shrugs', category: 'shoulders' },

  // Arms
  { id: 'bicep-curl', name: 'Bicep Curl', category: 'arms' },
  { id: 'hammer-curl', name: 'Hammer Curl', category: 'arms' },
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', category: 'arms' },
  { id: 'tricep-dip', name: 'Tricep Dip', category: 'arms' },
  { id: 'skull-crusher', name: 'Skull Crusher', category: 'arms' },

  // Core
  { id: 'plank', name: 'Plank', category: 'core' },
  { id: 'crunches', name: 'Crunches', category: 'core' },
  { id: 'leg-raises', name: 'Leg Raises', category: 'core' },
  { id: 'russian-twist', name: 'Russian Twist', category: 'core' },
  { id: 'cable-crunch', name: 'Cable Crunch', category: 'core' },
];

export const getExerciseById = (id: string): Exercise | undefined => {
  return exercises.find(e => e.id === id);
};

export const getExercisesByCategory = (category: string): Exercise[] => {
  return exercises.filter(e => e.category === category);
};
