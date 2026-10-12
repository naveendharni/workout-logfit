import type { Equipment, MuscleGroup } from '../src/generated/prisma/enums.js';

type SeedExercise = { slug: string; name: string; muscleGroup: MuscleGroup; equipment: Equipment };

const e = (slug: string, name: string, muscleGroup: MuscleGroup, equipment: Equipment): SeedExercise => ({
  slug,
  name,
  muscleGroup,
  equipment,
});

// Slugs from the original web/src/data/exercises.ts are kept unchanged so local workouts can be imported.
export const exercises: SeedExercise[] = [
  // Chest
  e('bench-press', 'Bench Press', 'CHEST', 'BARBELL'),
  e('incline-bench', 'Incline Bench Press', 'CHEST', 'BARBELL'),
  e('decline-bench', 'Decline Bench Press', 'CHEST', 'BARBELL'),
  e('dumbbell-bench-press', 'Dumbbell Bench Press', 'CHEST', 'DUMBBELL'),
  e('incline-dumbbell-press', 'Incline Dumbbell Press', 'CHEST', 'DUMBBELL'),
  e('dumbbell-fly', 'Dumbbell Fly', 'CHEST', 'DUMBBELL'),
  e('cable-crossover', 'Cable Crossover', 'CHEST', 'CABLE'),
  e('machine-chest-press', 'Machine Chest Press', 'CHEST', 'MACHINE'),
  e('pec-deck', 'Pec Deck', 'CHEST', 'MACHINE'),
  e('push-ups', 'Push Ups', 'CHEST', 'BODYWEIGHT'),
  e('chest-dip', 'Chest Dip', 'CHEST', 'BODYWEIGHT'),
  e('smith-bench-press', 'Smith Machine Bench Press', 'CHEST', 'SMITH_MACHINE'),

  // Back
  e('deadlift', 'Deadlift', 'BACK', 'BARBELL'),
  e('barbell-row', 'Barbell Row', 'BACK', 'BARBELL'),
  e('pendlay-row', 'Pendlay Row', 'BACK', 'BARBELL'),
  e('t-bar-row', 'T-Bar Row', 'BACK', 'BARBELL'),
  e('dumbbell-row', 'One-Arm Dumbbell Row', 'BACK', 'DUMBBELL'),
  e('pull-ups', 'Pull Ups', 'BACK', 'BODYWEIGHT'),
  e('chin-ups', 'Chin Ups', 'BACK', 'BODYWEIGHT'),
  e('lat-pulldown', 'Lat Pulldown', 'BACK', 'CABLE'),
  e('seated-row', 'Seated Cable Row', 'BACK', 'CABLE'),
  e('straight-arm-pulldown', 'Straight-Arm Pulldown', 'BACK', 'CABLE'),
  e('machine-row', 'Machine Row', 'BACK', 'MACHINE'),
  e('back-extension', 'Back Extension', 'BACK', 'BODYWEIGHT'),

  // Shoulders
  e('overhead-press', 'Overhead Press', 'SHOULDERS', 'BARBELL'),
  e('dumbbell-shoulder-press', 'Dumbbell Shoulder Press', 'SHOULDERS', 'DUMBBELL'),
  e('arnold-press', 'Arnold Press', 'SHOULDERS', 'DUMBBELL'),
  e('lateral-raise', 'Lateral Raise', 'SHOULDERS', 'DUMBBELL'),
  e('cable-lateral-raise', 'Cable Lateral Raise', 'SHOULDERS', 'CABLE'),
  e('front-raise', 'Front Raise', 'SHOULDERS', 'DUMBBELL'),
  e('rear-delt-fly', 'Rear Delt Fly', 'SHOULDERS', 'DUMBBELL'),
  e('reverse-pec-deck', 'Reverse Pec Deck', 'SHOULDERS', 'MACHINE'),
  e('face-pull', 'Face Pull', 'SHOULDERS', 'CABLE'),
  e('upright-row', 'Upright Row', 'SHOULDERS', 'BARBELL'),
  e('machine-shoulder-press', 'Machine Shoulder Press', 'SHOULDERS', 'MACHINE'),
  e('shrugs', 'Shrugs', 'SHOULDERS', 'DUMBBELL'),
  e('band-pull-apart', 'Band Pull-Apart', 'SHOULDERS', 'BAND'),

  // Biceps
  e('bicep-curl', 'Bicep Curl', 'BICEPS', 'DUMBBELL'),
  e('barbell-curl', 'Barbell Curl', 'BICEPS', 'BARBELL'),
  e('ez-bar-curl', 'EZ-Bar Curl', 'BICEPS', 'EZ_BAR'),
  e('hammer-curl', 'Hammer Curl', 'BICEPS', 'DUMBBELL'),
  e('incline-dumbbell-curl', 'Incline Dumbbell Curl', 'BICEPS', 'DUMBBELL'),
  e('preacher-curl', 'Preacher Curl', 'BICEPS', 'EZ_BAR'),
  e('cable-curl', 'Cable Curl', 'BICEPS', 'CABLE'),
  e('concentration-curl', 'Concentration Curl', 'BICEPS', 'DUMBBELL'),

  // Triceps
  e('tricep-pushdown', 'Tricep Pushdown', 'TRICEPS', 'CABLE'),
  e('rope-pushdown', 'Rope Pushdown', 'TRICEPS', 'CABLE'),
  e('overhead-tricep-extension', 'Overhead Tricep Extension', 'TRICEPS', 'DUMBBELL'),
  e('skull-crusher', 'Skull Crusher', 'TRICEPS', 'EZ_BAR'),
  e('close-grip-bench', 'Close-Grip Bench Press', 'TRICEPS', 'BARBELL'),
  e('tricep-dip', 'Tricep Dip', 'TRICEPS', 'BODYWEIGHT'),
  e('tricep-kickback', 'Tricep Kickback', 'TRICEPS', 'DUMBBELL'),

  // Forearms
  e('wrist-curl', 'Wrist Curl', 'FOREARMS', 'DUMBBELL'),
  e('reverse-curl', 'Reverse Curl', 'FOREARMS', 'BARBELL'),
  e('farmers-walk', "Farmer's Walk", 'FOREARMS', 'DUMBBELL'),

  // Quads
  e('squat', 'Squat', 'QUADS', 'BARBELL'),
  e('front-squat', 'Front Squat', 'QUADS', 'BARBELL'),
  e('goblet-squat', 'Goblet Squat', 'QUADS', 'DUMBBELL'),
  e('hack-squat', 'Hack Squat', 'QUADS', 'MACHINE'),
  e('leg-press', 'Leg Press', 'QUADS', 'MACHINE'),
  e('leg-extension', 'Leg Extension', 'QUADS', 'MACHINE'),
  e('lunges', 'Lunges', 'QUADS', 'DUMBBELL'),
  e('bulgarian-split-squat', 'Bulgarian Split Squat', 'QUADS', 'DUMBBELL'),
  e('step-up', 'Step Up', 'QUADS', 'DUMBBELL'),
  e('smith-squat', 'Smith Machine Squat', 'QUADS', 'SMITH_MACHINE'),

  // Hamstrings
  e('romanian-deadlift', 'Romanian Deadlift', 'HAMSTRINGS', 'BARBELL'),
  e('dumbbell-rdl', 'Dumbbell Romanian Deadlift', 'HAMSTRINGS', 'DUMBBELL'),
  e('leg-curl', 'Lying Leg Curl', 'HAMSTRINGS', 'MACHINE'),
  e('seated-leg-curl', 'Seated Leg Curl', 'HAMSTRINGS', 'MACHINE'),
  e('good-morning', 'Good Morning', 'HAMSTRINGS', 'BARBELL'),

  // Glutes
  e('hip-thrust', 'Hip Thrust', 'GLUTES', 'BARBELL'),
  e('glute-bridge', 'Glute Bridge', 'GLUTES', 'BODYWEIGHT'),
  e('cable-kickback', 'Cable Glute Kickback', 'GLUTES', 'CABLE'),
  e('hip-abduction', 'Hip Abduction', 'GLUTES', 'MACHINE'),

  // Calves
  e('calf-raises', 'Standing Calf Raise', 'CALVES', 'MACHINE'),
  e('seated-calf-raise', 'Seated Calf Raise', 'CALVES', 'MACHINE'),

  // Core
  e('plank', 'Plank', 'CORE', 'BODYWEIGHT'),
  e('crunches', 'Crunches', 'CORE', 'BODYWEIGHT'),
  e('leg-raises', 'Hanging Leg Raise', 'CORE', 'BODYWEIGHT'),
  e('russian-twist', 'Russian Twist', 'CORE', 'BODYWEIGHT'),
  e('cable-crunch', 'Cable Crunch', 'CORE', 'CABLE'),
  e('ab-wheel', 'Ab Wheel Rollout', 'CORE', 'OTHER'),
  e('dead-bug', 'Dead Bug', 'CORE', 'BODYWEIGHT'),
  e('pallof-press', 'Pallof Press', 'CORE', 'CABLE'),

  // Full body
  e('kettlebell-swing', 'Kettlebell Swing', 'FULL_BODY', 'KETTLEBELL'),
  e('power-clean', 'Power Clean', 'FULL_BODY', 'BARBELL'),
  e('thruster', 'Thruster', 'FULL_BODY', 'BARBELL'),
  e('burpee', 'Burpee', 'FULL_BODY', 'BODYWEIGHT'),
];
