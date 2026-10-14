import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Dumbbell, ChevronDown, ChevronUp, Zap, Pencil, Trash2, Loader2 } from 'lucide-react';
import type { Stats, Unit, Workout } from '../types';
import { formatTime } from '../hooks/useTimer';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../auth/useAuth';
import { ApiError, apiFetch } from '../lib/api';
import { draftFromWorkout, readDraft, writeDraft } from '../lib/draft';
import { formatVolume, formatWeight, unitLabel } from '../lib/units';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';

type Page = { workouts: Workout[]; nextCursor: string | null };

const PAGE_SIZE = 20;

// First page on mount, then "Load more" appends the next page using the cursor from the last one.
function useWorkoutPages() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    apiFetch<Page>(`/workouts?limit=${PAGE_SIZE}`).then(
      (page) => {
        if (!active) return;
        setWorkouts(page.workouts);
        setNextCursor(page.nextCursor);
        setStatus('ready');
      },
      () => active && setStatus('error'),
    );
    return () => {
      active = false;
    };
  }, [version]);

  const retry = useCallback(() => {
    setStatus('loading');
    setVersion((v) => v + 1);
  }, []);

  const loadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    setMoreError(false);
    try {
      const page = await apiFetch<Page>(`/workouts?limit=${PAGE_SIZE}&cursor=${nextCursor}`);
      setWorkouts((prev) => [...prev, ...page.workouts]);
      setNextCursor(page.nextCursor);
    } catch {
      setMoreError(true);
    } finally {
      setLoadingMore(false);
    }
  };

  const remove = (id: string) => setWorkouts((prev) => prev.filter((w) => w.id !== id));

  return { workouts, nextCursor, status, retry, loadMore, loadingMore, moreError, remove };
}

export default function History() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const unit = user?.unit ?? 'KG';
  const { workouts, nextCursor, status, retry, loadMore, loadingMore, moreError, remove } = useWorkoutPages();
  const stats = useApi<Stats>('/stats');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const editWorkout = (workout: Workout) => {
    if (!user) return;
    const existing = readDraft(user.id);
    if (existing?.exercises.length && !confirm('You have a workout in progress. Replace it with this one to edit?')) return;
    writeDraft(user.id, draftFromWorkout(workout));
    navigate('/workout');
  };

  const deleteWorkout = async (workout: Workout) => {
    if (!confirm('Delete this workout? This can’t be undone.')) return;
    setActionError(null);
    try {
      await apiFetch(`/workouts/${workout.id}`, { method: 'DELETE' });
      remove(workout.id);
      stats.reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Couldn’t delete the workout. Try again.');
    }
  };

  const summary = stats.data;

  return (
    <div id="history-page" className="min-h-screen px-6 pt-14 pb-10 max-w-lg mx-auto">
      {/* Header */}
      <header id="history-header" className="mb-8 animate-slide-up opacity-0" style={{ animationDelay: '0s', animationFillMode: 'forwards' }}>
        <div id="history-status" className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-info" />
          <span className="text-xs font-medium text-muted tracking-widest uppercase">Workout Log</span>
        </div>
        <h1 id="history-title" className="font-display text-5xl text-foreground leading-none">
          HISTORY<span className="text-accent">.</span>
        </h1>
      </header>

      {/* Stats Summary (all time, from the server) */}
      {summary && summary.totalWorkouts > 0 && (
        <div
          id="history-stats-summary"
          className="grid grid-cols-3 gap-3 mb-8 animate-slide-up opacity-0"
          style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
        >
          <div id="history-stat-sessions" className="bg-surface border border-border rounded-xl p-4 text-center">
            <p className="font-display text-2xl text-accent">{summary.totalWorkouts}</p>
            <p className="text-[10px] text-muted tracking-widest">SESSIONS</p>
          </div>
          <div id="history-stat-exercises" className="bg-surface border border-border rounded-xl p-4 text-center">
            <p className="font-display text-2xl text-info">{summary.totalExercises}</p>
            <p className="text-[10px] text-muted tracking-widest">EXERCISES</p>
          </div>
          <div id="history-stat-sets" className="bg-surface border border-border rounded-xl p-4 text-center">
            <p className="font-display text-2xl text-warning">{summary.totalSets}</p>
            <p className="text-[10px] text-muted tracking-widest">TOTAL SETS</p>
          </div>
        </div>
      )}

      {actionError && (
        <p role="alert" className="mb-4 text-sm text-danger">
          {actionError}
        </p>
      )}

      {/* Workout List */}
      {status === 'loading' ? (
        <LoadingState label="Loading your workouts" />
      ) : status === 'error' ? (
        <ErrorState message="Couldn't load your workouts." onRetry={retry} />
      ) : workouts.length === 0 ? (
        <EmptyState icon={<Calendar size={28} />} title="No workout history" text="Complete a workout to see it here" />
      ) : (
        <>
          <div id="workout-list" className="space-y-3">
            {workouts.map((workout, index) => (
              <div
                key={workout.id}
                className="animate-slide-up opacity-0"
                style={{ animationDelay: `${0.15 + Math.min(index, 10) * 0.05}s`, animationFillMode: 'forwards' }}
              >
                <WorkoutCard
                  workout={workout}
                  unit={unit}
                  expanded={expandedId === workout.id}
                  onToggle={() => toggleExpand(workout.id)}
                  onEdit={() => editWorkout(workout)}
                  onDelete={() => deleteWorkout(workout)}
                />
              </div>
            ))}
          </div>
          {nextCursor && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full mt-4 py-3.5 rounded-xl bg-surface border border-border text-sm font-medium text-muted hover:text-foreground hover:border-accent/30 flex items-center justify-center gap-2"
            >
              {loadingMore && <Loader2 size={14} className="animate-spin" />}
              {loadingMore ? 'Loading' : moreError ? 'Couldn’t load more. Try again' : 'Load more'}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function WorkoutCard({
  workout,
  unit,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  workout: Workout;
  unit: Unit;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const totalSets = workout.exercises.reduce(
    (acc, e) => acc + e.sets.filter(s => s.completed).length,
    0
  );

  const totalVolume = workout.exercises.reduce((acc, e) => {
    return acc + e.sets.reduce((setAcc, s) => {
      return setAcc + (s.completed ? s.reps * s.weightKg : 0);
    }, 0);
  }, 0);

  const date = new Date(workout.startedAt);

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-accent/20 transition-all duration-200">
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full p-5 text-left flex items-center justify-between"
      >
        <div>
          <p className="font-semibold text-lg text-foreground">
            {date.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted mt-2">
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-accent" />
              <span className="font-mono">{formatTime(workout.durationSec)}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Dumbbell size={14} className="text-info" />
              {workout.exercises.length} exercises
            </span>
          </div>
        </div>
        <div className={`p-2 rounded-lg transition-all duration-200 ${expanded ? 'bg-accent/10' : 'bg-surface-elevated'}`}>
          {expanded ? (
            <ChevronUp className={`transition-colors duration-200 ${expanded ? 'text-accent' : 'text-muted'}`} size={20} />
          ) : (
            <ChevronDown className="text-muted" size={20} />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border pt-5 animate-scale-in">
          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-surface-elevated rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg bg-success/20 flex items-center justify-center">
                  <Dumbbell size={12} className="text-success" />
                </div>
                <p className="text-[10px] text-muted tracking-widest">SETS</p>
              </div>
              <p className="font-display text-2xl text-foreground">{totalSets}</p>
            </div>
            <div className="bg-surface-elevated rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Zap size={12} className="text-accent" />
                </div>
                <p className="text-[10px] text-muted tracking-widest">VOLUME</p>
              </div>
              <p className="font-display text-2xl text-foreground">{formatVolume(totalVolume, unit)}<span className="text-sm text-muted ml-1">{unitLabel(unit)}</span></p>
            </div>
          </div>

          {/* Exercises */}
          <div className="space-y-3">
            {workout.exercises.map(exercise => (
              <div key={exercise.id} className="bg-surface-elevated rounded-xl p-4 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <span className="font-display text-sm text-accent">{exercise.exerciseName.charAt(0)}</span>
                  </div>
                  <p className="font-semibold text-foreground">{exercise.exerciseName}</p>
                </div>
                <div className="space-y-1.5">
                  {exercise.sets
                    .filter(s => s.completed)
                    .map((set, index) => (
                      <div key={set.id} className="flex items-center gap-3 text-sm">
                        <span className="font-mono text-muted w-8">#{index + 1}</span>
                        <span className="font-mono text-foreground">{formatWeight(set.weightKg, unit)}<span className="text-muted ml-0.5">{unitLabel(unit)}</span></span>
                        <span className="text-muted">×</span>
                        <span className="font-mono text-accent">{set.reps}<span className="text-muted ml-0.5">reps</span></span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            <button
              onClick={onEdit}
              className="py-3 rounded-xl bg-surface-elevated border border-border text-sm font-medium text-foreground hover:border-accent/40 flex items-center justify-center gap-2"
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              onClick={onDelete}
              className="py-3 rounded-xl bg-surface-elevated border border-border text-sm font-medium text-danger hover:border-danger/40 flex items-center justify-center gap-2"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
