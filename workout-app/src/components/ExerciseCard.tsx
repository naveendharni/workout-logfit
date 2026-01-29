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
    <div className="bg-[#111111] rounded-2xl border border-[#252525] overflow-hidden hover:border-[#c8ff00]/20 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[#252525]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#c8ff00]/10 flex items-center justify-center">
            <span className="font-display text-xl text-[#c8ff00]">{exercise.exerciseName.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-[#fafafa]">{exercise.exerciseName}</h3>
            <p className="text-sm text-[#737373]">
              {completedCount}/{exercise.sets.length} sets completed
            </p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="p-3 rounded-xl text-[#737373] hover:text-[#ff3b3b] hover:bg-[#ff3b3b]/10 transition-all duration-200"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Sets */}
      <div className="p-5">
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-3 text-[11px] font-semibold text-[#737373] tracking-widest mb-4 px-2">
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
                  ? 'bg-[#00ff88]/5 border border-[#00ff88]/20'
                  : 'bg-[#1a1a1a] border border-transparent'
              }`}
            >
              {/* Set Number */}
              <div className="col-span-2 pl-1">
                <span className={`font-mono text-base font-bold ${set.completed ? 'text-[#00ff88]' : 'text-[#737373]'}`}>
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Weight */}
              <div className="col-span-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => updateSet(set.id, { weight: Math.max(0, set.weight - 5) })}
                  className="p-2.5 rounded-lg bg-[#252525] hover:bg-[#c8ff00]/20 text-[#737373] hover:text-[#c8ff00] transition-all duration-150 active:scale-95"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  value={set.weight}
                  onChange={e => updateSet(set.id, { weight: Number(e.target.value) })}
                  className="w-16 bg-[#252525] rounded-lg px-3 py-2.5 text-center text-base font-mono font-semibold text-[#fafafa] focus:ring-2 focus:ring-[#c8ff00]/50"
                />
                <button
                  onClick={() => updateSet(set.id, { weight: set.weight + 5 })}
                  className="p-2.5 rounded-lg bg-[#252525] hover:bg-[#c8ff00]/20 text-[#737373] hover:text-[#c8ff00] transition-all duration-150 active:scale-95"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Reps */}
              <div className="col-span-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => updateSet(set.id, { reps: Math.max(0, set.reps - 1) })}
                  className="p-2.5 rounded-lg bg-[#252525] hover:bg-[#c8ff00]/20 text-[#737373] hover:text-[#c8ff00] transition-all duration-150 active:scale-95"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  value={set.reps}
                  onChange={e => updateSet(set.id, { reps: Number(e.target.value) })}
                  className="w-14 bg-[#252525] rounded-lg px-3 py-2.5 text-center text-base font-mono font-semibold text-[#fafafa] focus:ring-2 focus:ring-[#c8ff00]/50"
                />
                <button
                  onClick={() => updateSet(set.id, { reps: set.reps + 1 })}
                  className="p-2.5 rounded-lg bg-[#252525] hover:bg-[#c8ff00]/20 text-[#737373] hover:text-[#c8ff00] transition-all duration-150 active:scale-95"
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
                      ? 'bg-[#00ff88] text-black shadow-[0_0_15px_rgba(0,255,136,0.3)]'
                      : 'bg-[#252525] text-[#737373] hover:bg-[#c8ff00]/20 hover:text-[#c8ff00]'
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
          className="group w-full mt-5 py-4 rounded-xl border-2 border-dashed border-[#252525] hover:border-[#c8ff00]/50 text-[#737373] hover:text-[#c8ff00] text-base font-medium transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.99]"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-200" />
          Add Set
        </button>
      </div>
    </div>
  );
}
