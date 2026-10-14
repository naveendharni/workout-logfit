import type { Unit } from '../types';

export const KG_PER_LB = 0.45359237;

export const toDisplay = (kg: number, unit: Unit) => (unit === 'KG' ? kg : kg / KG_PER_LB);

// Stored with 3 decimals (the database column), enough that 225 lb round-trips back to exactly 225.
export const toKg = (value: number, unit: Unit) =>
  Math.round((unit === 'KG' ? value : value * KG_PER_LB) * 1000) / 1000;

export const formatWeight = (kg: number, unit: Unit) => {
  const value = toDisplay(kg, unit);
  return String(unit === 'KG' ? Math.round(value * 100) / 100 : Math.round(value * 10) / 10);
};

export const unitLabel = (unit: Unit) => (unit === 'KG' ? 'kg' : 'lbs');

// Smallest common plate jump on each side of the bar.
export const weightStep = (unit: Unit) => (unit === 'KG' ? 2.5 : 5);

export const formatVolume = (kg: number, unit: Unit) => {
  const value = toDisplay(kg, unit);
  return value >= 10000 ? `${(value / 1000).toFixed(1)}k` : Math.round(value).toLocaleString();
};
