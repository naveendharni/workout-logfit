import type { Equipment, MuscleGroup } from '../types';

export const MUSCLE_GROUPS: { value: MuscleGroup; label: string }[] = [
  { value: 'CHEST', label: 'Chest' },
  { value: 'BACK', label: 'Back' },
  { value: 'SHOULDERS', label: 'Shoulders' },
  { value: 'BICEPS', label: 'Biceps' },
  { value: 'TRICEPS', label: 'Triceps' },
  { value: 'FOREARMS', label: 'Forearms' },
  { value: 'QUADS', label: 'Quads' },
  { value: 'HAMSTRINGS', label: 'Hamstrings' },
  { value: 'GLUTES', label: 'Glutes' },
  { value: 'CALVES', label: 'Calves' },
  { value: 'CORE', label: 'Core' },
  { value: 'FULL_BODY', label: 'Full body' },
];

export const EQUIPMENT: { value: Equipment; label: string }[] = [
  { value: 'BARBELL', label: 'Barbell' },
  { value: 'DUMBBELL', label: 'Dumbbell' },
  { value: 'MACHINE', label: 'Machine' },
  { value: 'CABLE', label: 'Cable' },
  { value: 'BODYWEIGHT', label: 'Bodyweight' },
  { value: 'KETTLEBELL', label: 'Kettlebell' },
  { value: 'BAND', label: 'Band' },
  { value: 'SMITH_MACHINE', label: 'Smith machine' },
  { value: 'EZ_BAR', label: 'EZ bar' },
  { value: 'OTHER', label: 'Other' },
];

const labels = new Map<string, string>([...MUSCLE_GROUPS, ...EQUIPMENT].map((o) => [o.value, o.label]));

export const labelFor = (value: string) => labels.get(value) ?? value;
