import { Plus, Minus, Check, Trash2 } from 'lucide-react';
import type { WorkoutExercise, WorkoutSet } from '../types';
import { generateId } from '../utils/storage';

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  onUpdate: (exercise: WorkoutExercise) => void;
  onRemove: () => void;
}

export default function ExerciseCard({ exercise, onUpdate, onRemove }: ExerciseCardProps) {
  const addSet = () => {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: WorkoutSet = {
      id: generateId(),
      reps: lastSet?.reps || 10,
      weight: lastSet?.weight || 0,
      completed: false,
    };
    onUpdate({ ...exercise, sets: [...exercise.sets, newSet] });
  };

  const updateSet = (setId: string, updates: Partial<WorkoutSet>) => {
    const newSets = exercise.sets.map(s =>
      s.id === setId ? { ...s, ...updates } : s
    );
    onUpdate({ ...exercise, sets: newSets });
  };

  const completedCount = exercise.sets.filter(s => s.completed).length;

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-accent/20 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <span className="font-display text-xl text-accent">{exercise.exerciseName.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">{exercise.exerciseName}</h3>
            <p className="text-sm text-muted">
              {completedCount}/{exercise.sets.length} sets completed
            </p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="p-3 rounded-xl text-muted hover:text-danger hover:bg-danger/10 transition-all duration-200"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Sets */}
      <div className="p-5">
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-3 text-[11px] font-semibold text-muted tracking-widest mb-4 px-2">
          <div className="col-span-2">SET</div>
          <div className="col-span-4 text-center">LBS</div>
          <div className="col-span-4 text-center">REPS</div>
          <div className="col-span-2"></div>
        </div>

        {/* Set Rows */}
        <div className="space-y-3">
          {exercise.sets.map((set, index) => (
            <div
              key={set.id}
              className={`grid grid-cols-12 gap-3 items-center p-3 rounded-xl transition-all duration-200 ${
                set.completed
                  ? 'bg-success/5 border border-success/20'
                  : 'bg-surface-elevated border border-transparent'
              }`}
            >
              {/* Set Number */}
              <div className="col-span-2 pl-1">
                <span className={`font-mono text-base font-bold ${set.completed ? 'text-success' : 'text-muted'}`}>
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Weight */}
              <div className="col-span-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => updateSet(set.id, { weight: Math.max(0, set.weight - 5) })}
                  className="btn-control"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  value={set.weight}
                  onChange={e => updateSet(set.id, { weight: Number(e.target.value) })}
                  className="w-16 input-number"
                />
                <button
                  onClick={() => updateSet(set.id, { weight: set.weight + 5 })}
                  className="btn-control"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Reps */}
              <div className="col-span-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => updateSet(set.id, { reps: Math.max(0, set.reps - 1) })}
                  className="btn-control"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  value={set.reps}
                  onChange={e => updateSet(set.id, { reps: Number(e.target.value) })}
                  className="w-14 input-number"
                />
                <button
                  onClick={() => updateSet(set.id, { reps: set.reps + 1 })}
                  className="btn-control"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Complete Button */}
              <div className="col-span-2 flex justify-end">
                <button
                  onClick={() => updateSet(set.id, { completed: !set.completed })}
                  className={`p-3 rounded-xl transition-all duration-200 active:scale-95 ${
                    set.completed
                      ? 'bg-success text-black shadow-[0_0_15px_rgba(0,255,136,0.3)]'
                      : 'bg-border text-muted hover:bg-accent/20 hover:text-accent'
                  }`}
                >
                  <Check size={18} strokeWidth={set.completed ? 3 : 2} />
                </button>
              </div>
            </div>
          ))}
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
