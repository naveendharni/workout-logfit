import { Plus, Minus, Check, Trash2 } from 'lucide-react';
import type { Unit, WorkoutExercise, WorkoutSet } from '../types';
import { toDisplay, toKg, unitLabel, weightStep } from '../lib/units';
import WeightInput from './WeightInput';

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  unit: Unit;
  onUpdate: (exercise: WorkoutExercise) => void;
  onRemove: () => void;
}

export default function ExerciseCard({ exercise, unit, onUpdate, onRemove }: ExerciseCardProps) {
  const addSet = () => {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: WorkoutSet = {
      id: crypto.randomUUID(),
      reps: lastSet?.reps ?? 10,
      weightKg: lastSet?.weightKg ?? 0,
      completed: false,
    };
    onUpdate({ ...exercise, sets: [...exercise.sets, newSet] });
  };

  const updateSet = (setId: string, updates: Partial<WorkoutSet>) => {
    onUpdate({ ...exercise, sets: exercise.sets.map(s => (s.id === setId ? { ...s, ...updates } : s)) });
  };

  const removeSet = (setId: string) => {
    onUpdate({ ...exercise, sets: exercise.sets.filter(s => s.id !== setId) });
  };

  // Steps happen in the display unit (2.5 kg or 5 lb), then convert back to kg.
  const stepWeight = (set: WorkoutSet, direction: 1 | -1) => {
    const next = Math.max(0, toDisplay(set.weightKg, unit) + direction * weightStep(unit));
    updateSet(set.id, { weightKg: toKg(next, unit) });
  };

  const completedCount = exercise.sets.filter(s => s.completed).length;
  const label = unitLabel(unit);

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-accent/20 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-accent/10 flex items-center justify-center">
            <span className="font-display text-xl text-accent">{exercise.exerciseName.charAt(0)}</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-lg text-foreground truncate">{exercise.exerciseName}</h3>
            <p className="text-sm text-muted">
              {completedCount}/{exercise.sets.length} sets completed
            </p>
          </div>
        </div>
        <button
          onClick={onRemove}
          aria-label={`Remove ${exercise.exerciseName}`}
          className="p-3 rounded-xl text-muted hover:text-danger hover:bg-danger/10 transition-all duration-200"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Sets */}
      <div className="p-5">
        {/* Set Rows. Weight and reps are stacked so every control keeps a full-size tap target on narrow phones. */}
        <div className="space-y-3">
          {exercise.sets.map((set, index) => {
            const setName = `Set ${index + 1}`;
            return (
              <div
                key={set.id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                  set.completed
                    ? 'bg-success/5 border border-success/20'
                    : 'bg-surface-elevated border border-transparent'
                }`}
              >
                {/* Set number, with a small remove button when there is more than one set */}
                <div className="w-7 shrink-0 flex flex-col items-center gap-1.5">
                  <span className={`font-mono text-base font-bold ${set.completed ? 'text-success' : 'text-muted'}`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {exercise.sets.length > 1 && (
                    <button
                      onClick={() => removeSet(set.id)}
                      aria-label={`Remove ${setName}`}
                      className="p-1 rounded text-muted hover:text-danger transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  {/* Weight */}
                  <div className="flex items-center gap-2">
                    <span className="w-9 shrink-0 text-[10px] font-semibold text-muted tracking-widest" aria-hidden="true">
                      {label.toUpperCase()}
                    </span>
                    <button onClick={() => stepWeight(set, -1)} aria-label={`${setName}: decrease weight`} className="btn-control">
                      <Minus size={16} />
                    </button>
                    <WeightInput
                      valueKg={set.weightKg}
                      unit={unit}
                      label={`${setName} weight in ${label}`}
                      onChange={weightKg => updateSet(set.id, { weightKg })}
                    />
                    <button onClick={() => stepWeight(set, 1)} aria-label={`${setName}: increase weight`} className="btn-control">
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Reps */}
                  <div className="flex items-center gap-2">
                    <span className="w-9 shrink-0 text-[10px] font-semibold text-muted tracking-widest" aria-hidden="true">
                      REPS
                    </span>
                    <button
                      onClick={() => updateSet(set.id, { reps: Math.max(0, set.reps - 1) })}
                      aria-label={`${setName}: decrease reps`}
                      className="btn-control"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      aria-label={`${setName} reps`}
                      value={set.reps}
                      onFocus={e => e.target.select()}
                      onChange={e => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                        updateSet(set.id, { reps: Number(digits || 0) });
                      }}
                      className="flex-1 min-w-0 max-w-24 input-number"
                    />
                    <button
                      onClick={() => updateSet(set.id, { reps: set.reps + 1 })}
                      aria-label={`${setName}: increase reps`}
                      className="btn-control"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Complete Button */}
                <button
                  onClick={() => updateSet(set.id, { completed: !set.completed })}
                  aria-label={`${setName}: ${set.completed ? 'mark not done' : 'mark done'}`}
                  aria-pressed={set.completed}
                  className={`shrink-0 p-3 rounded-xl transition-all duration-200 active:scale-95 ${
                    set.completed
                      ? 'bg-success text-black shadow-[0_0_15px_rgba(0,255,136,0.3)]'
                      : 'bg-border text-muted hover:bg-accent/20 hover:text-accent'
                  }`}
                >
                  <Check size={18} strokeWidth={set.completed ? 3 : 2} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Add Set Button */}
        <button
          onClick={addSet}
          className="group w-full mt-5 py-4 rounded-xl border-2 border-dashed border-border hover:border-accent/50 text-muted hover:text-accent text-base font-medium transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.99]"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-200" />
          Add Set
        </button>
      </div>
    </div>
  );
}
