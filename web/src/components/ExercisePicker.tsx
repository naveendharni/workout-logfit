import { useEffect, useId, useMemo, useState, type FormEvent } from 'react';
import { Plus, X, Search, Check, Trash2, SlidersHorizontal } from 'lucide-react';
import type { Equipment, Exercise, MuscleGroup } from '../types';
import { useApi } from '../hooks/useApi';
import { ApiError, apiFetch } from '../lib/api';
import { EQUIPMENT, MUSCLE_GROUPS, labelFor } from '../lib/exercise-meta';
import { ErrorState, LoadingState } from './StateViews';

type Props = {
  onSelect: (exercises: Exercise[]) => void;
  onClose: () => void;
};

const selectClass =
  'w-full bg-surface border border-border rounded-xl px-3 py-3 text-sm text-foreground focus:outline-none focus:border-accent/60';

export default function ExercisePicker({ onSelect, onClose }: Props) {
  const titleId = useId();
  const { data, error, loading, reload } = useApi<{ exercises: Exercise[] }>('/exercises');
  const [search, setSearch] = useState('');
  const [muscle, setMuscle] = useState<MuscleGroup | null>(null);
  const [equipment, setEquipment] = useState<Equipment | ''>('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const exercises = useMemo(() => data?.exercises ?? [], [data]);

  // Filtering happens on the device: the list is small and this keeps search instant.
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return exercises.filter(
      (e) =>
        (!term || e.name.toLowerCase().includes(term)) &&
        (!muscle || e.muscleGroup === muscle) &&
        (!equipment || e.equipment === equipment),
    );
  }, [exercises, search, muscle, equipment]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deleteCustom = async (exercise: Exercise) => {
    if (!confirm(`Delete "${exercise.name}"?`)) return;
    setActionError(null);
    try {
      await apiFetch(`/exercises/${exercise.id}`, { method: 'DELETE' });
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(exercise.id);
        return next;
      });
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Could not delete the exercise.');
    }
  };

  const handleCreated = (exercise: Exercise) => {
    setCreating(false);
    setSearch('');
    setMuscle(null);
    setEquipment('');
    setSelected((prev) => new Set(prev).add(exercise.id));
    reload();
  };

  const handleAdd = () => onSelect(exercises.filter((e) => selected.has(e.id)));

  const pill = (active: boolean) =>
    `btn-pill whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
      active ? 'bg-accent text-black' : 'bg-surface-elevated text-muted border border-border hover:border-accent/30 hover:text-foreground'
    }`;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-end animate-fade-in" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg mx-auto max-h-[90vh] bg-bg rounded-t-3xl overflow-hidden flex flex-col border-t border-border animate-slide-up"
      >
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between mb-5">
            <h2 id={titleId} className="font-display text-2xl text-foreground tracking-wide">
              {creating ? 'NEW EXERCISE' : 'ADD EXERCISE'}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-xl bg-surface-elevated border border-border text-muted hover:text-white hover:border-accent/30 transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>

          {!creating && (
            <>
              <div className="relative mb-3">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden="true" />
                <input
                  type="search"
                  aria-label="Search exercises"
                  placeholder="Search exercises..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl pl-11 pr-4 py-3.5 text-foreground placeholder-muted focus:outline-none focus:border-accent/50 transition-colors duration-200"
                />
              </div>

              <div className="flex items-center gap-2 mb-3">
                <SlidersHorizontal size={16} className="text-muted shrink-0" aria-hidden="true" />
                <select
                  aria-label="Filter by equipment"
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value as Equipment | '')}
                  className={selectClass}
                >
                  <option value="">All equipment</option>
                  {EQUIPMENT.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" role="group" aria-label="Filter by muscle group">
                <button onClick={() => setMuscle(null)} aria-pressed={!muscle} className={pill(!muscle)}>
                  ALL
                </button>
                {MUSCLE_GROUPS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMuscle(m.value)}
                    aria-pressed={muscle === m.value}
                    className={`${pill(muscle === m.value)} uppercase`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {creating ? (
            <CustomExerciseForm initialName={search.trim()} onCreated={handleCreated} onCancel={() => setCreating(false)} />
          ) : loading && !data ? (
            <LoadingState label="Loading exercises" />
          ) : error && !data ? (
            <ErrorState message="Couldn't load exercises." onRetry={reload} />
          ) : (
            <>
              {actionError && (
                <p role="alert" className="mb-3 text-sm text-danger">
                  {actionError}
                </p>
              )}
              {filtered.length === 0 && (
                <p className="text-center text-sm text-muted py-6">No exercises match. Create it as a custom exercise.</p>
              )}
              <ul className="space-y-2">
                {filtered.map((exercise) => {
                  const isSelected = selected.has(exercise.id);
                  return (
                    <li key={exercise.id} className="flex items-stretch gap-2">
                      <button
                        onClick={() => toggleSelect(exercise.id)}
                        aria-pressed={isSelected}
                        className={`group flex-1 text-left p-4 rounded-xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                          isSelected
                            ? 'bg-accent/10 border-accent/40'
                            : 'bg-surface border-border hover:border-accent/30 hover:bg-surface-elevated'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p
                              className={`font-semibold truncate transition-colors duration-200 ${
                                isSelected ? 'text-accent' : 'text-foreground group-hover:text-accent'
                              }`}
                            >
                              {exercise.name}
                              {exercise.isCustom && (
                                <span className="ml-2 align-middle text-[10px] font-bold tracking-wider text-info border border-info/30 rounded px-1.5 py-0.5">
                                  CUSTOM
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted uppercase tracking-wider mt-0.5">
                              {labelFor(exercise.muscleGroup)} · {labelFor(exercise.equipment)}
                            </p>
                          </div>
                          {isSelected ? (
                            <Check size={18} className="text-accent shrink-0" />
                          ) : (
                            <Plus size={18} className="text-muted group-hover:text-accent transition-colors duration-200 shrink-0" />
                          )}
                        </div>
                      </button>
                      {exercise.isCustom && (
                        <button
                          onClick={() => deleteCustom(exercise)}
                          aria-label={`Delete custom exercise ${exercise.name}`}
                          className="px-3 rounded-xl border border-border bg-surface text-muted hover:text-danger hover:border-danger/30 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
              <button
                onClick={() => setCreating(true)}
                className="w-full mt-4 py-4 rounded-xl border-2 border-dashed border-border hover:border-accent/50 text-muted hover:text-accent font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Create custom exercise
              </button>
            </>
          )}
        </div>

        {/* Add Selected Button */}
        {!creating && selected.size > 0 && (
          <div className="p-5 border-t border-border">
            <button
              onClick={handleAdd}
              className="w-full py-4 rounded-xl bg-accent text-black font-semibold text-base active:scale-[0.98] transition-transform duration-150"
            >
              Add {selected.size} Exercise{selected.size > 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CustomExerciseForm({
  initialName,
  onCreated,
  onCancel,
}: {
  initialName: string;
  onCreated: (exercise: Exercise) => void;
  onCancel: () => void;
}) {
  const id = useId();
  const [name, setName] = useState(initialName);
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('CHEST');
  const [equipment, setEquipment] = useState<Equipment>('BARBELL');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { exercise } = await apiFetch<{ exercise: Exercise }>('/exercises', {
        method: 'POST',
        body: JSON.stringify({ name, muscleGroup, equipment }),
      });
      onCreated(exercise);
    } catch (err) {
      setError(err instanceof ApiError ? (err.issues?.[0]?.message ?? err.message) : 'Could not save the exercise.');
      setSaving(false);
    }
  };

  const labelClass = 'block text-xs font-semibold text-muted tracking-widest uppercase mb-2';

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <div>
        <label htmlFor={`${id}-name`} className={labelClass}>
          Name
        </label>
        <input
          id={`${id}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          required
          autoFocus
          className="w-full bg-surface border border-border rounded-xl px-4 py-3.5 text-foreground placeholder-muted focus:outline-none focus:border-accent/60"
          placeholder="e.g. Landmine Press"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${id}-muscle`} className={labelClass}>
            Muscle group
          </label>
          <select id={`${id}-muscle`} value={muscleGroup} onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)} className={selectClass}>
            {MUSCLE_GROUPS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-equipment`} className={labelClass}>
            Equipment
          </label>
          <select id={`${id}-equipment`} value={equipment} onChange={(e) => setEquipment(e.target.value as Equipment)} className={selectClass}>
            {EQUIPMENT.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3.5 rounded-xl bg-surface-elevated border border-border text-foreground font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-3.5 rounded-xl bg-accent text-black font-semibold disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save exercise'}
        </button>
      </div>
    </form>
  );
}
