import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Check, Timer, ChevronDown, Play, Pause, Square, Loader2, AlertTriangle } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTimer, formatTime } from '../hooks/useTimer';
import type { Draft, Exercise, WorkoutExercise } from '../types';
import { useAuth } from '../auth/useAuth';
import { ApiError, apiFetch } from '../lib/api';
import { draftKey, newDraft, toWorkoutBody } from '../lib/draft';
import ExerciseCard from '../components/ExerciseCard';
import ExercisePicker from '../components/ExercisePicker';
import { RestTimer } from '../components/Timer';

export default function WorkoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // RequireAuth guarantees a user here.
  const userId = user!.id;
  const unit = user!.unit;
  const [draft, setDraft] = useLocalStorage<Draft | null>(draftKey(userId), null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { seconds, isRunning, start, pause, reset } = useTimer(0, false);

  useEffect(() => {
    setDraft(prev => prev ?? newDraft());
  }, [setDraft]);

  const isEditing = Boolean(draft?.serverId);
  const currentWorkout = draft;

  const toggleTimer = () => {
    if (!timerEnabled) {
      setTimerEnabled(true);
      start();
    } else if (isRunning) {
      pause();
    } else {
      start();
    }
  };

  const addExercises = (selected: Exercise[]) => {
    if (!currentWorkout || selected.length === 0) return;
    const newExercises: WorkoutExercise[] = selected.map(exercise => ({
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: [{ id: crypto.randomUUID(), reps: 10, weightKg: 0, completed: false }],
    }));
    setDraft({
      ...currentWorkout,
      exercises: [...currentWorkout.exercises, ...newExercises],
    });
    setShowExerciseModal(false);
  };

  const updateExercise = (updated: WorkoutExercise) => {
    if (!currentWorkout) return;
    setDraft({
      ...currentWorkout,
      exercises: currentWorkout.exercises.map(e =>
        e.id === updated.id ? updated : e
      ),
    });
  };

  const removeExercise = (exerciseId: string) => {
    if (!currentWorkout) return;
    setDraft({
      ...currentWorkout,
      exercises: currentWorkout.exercises.filter(e => e.id !== exerciseId),
    });
  };

  // The draft stays on the device until the server confirms the save, so a failed request loses nothing.
  // New workouts send their clientId, so retrying after a timeout can't create a duplicate.
  const finishWorkout = async () => {
    if (!currentWorkout || saving) return;
    if (timerEnabled) pause();
    setSaving(true);
    setSaveError(null);
    const body = toWorkoutBody(currentWorkout, timerEnabled ? seconds : currentWorkout.durationSec);
    try {
      if (currentWorkout.serverId) {
        await apiFetch(`/workouts/${currentWorkout.serverId}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await apiFetch('/workouts', {
          method: 'POST',
          body: JSON.stringify({ ...body, clientId: currentWorkout.clientId }),
        });
      }
      setDraft(null);
      reset();
      navigate('/history');
    } catch (err) {
      setSaveError(
        err instanceof ApiError && err.status < 500
          ? err.message
          : 'Couldn’t save. Your workout is kept on this device, try again when you have signal.',
      );
      setSaving(false);
    }
  };

  const cancelWorkout = () => {
    const message = isEditing ? 'Discard your changes to this workout?' : 'Are you sure you want to cancel this workout?';
    if (confirm(message)) {
      setDraft(null);
      reset();
      navigate(isEditing ? '/history' : '/');
    }
  };

  const completedSets = currentWorkout?.exercises.reduce(
    (acc, e) => acc + e.sets.filter(s => s.completed).length,
    0
  ) || 0;

  const totalSets = currentWorkout?.exercises.reduce(
    (acc, e) => acc + e.sets.length,
    0
  ) || 0;

  return (
    <div id="workout-page" className="min-h-screen px-6 pt-10 pb-36 max-w-lg mx-auto">
      {/* Header */}
      <header id="workout-header" className="flex items-center justify-between mb-6">
        <div id="workout-info">
          <div id="workout-title-row" className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-3xl text-foreground tracking-wide">{isEditing ? 'EDIT WORKOUT' : 'ACTIVE SESSION'}</h1>
            {!isEditing && (
              <div id="live-indicator" className="flex items-center gap-1.5 px-2 py-0.5 bg-accent/10 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-bold text-accent tracking-wider">LIVE</span>
              </div>
            )}
          </div>
          <div id="workout-stats" className="flex items-center gap-4 text-sm text-muted">
            <button
              id="workout-timer-toggle"
              onClick={toggleTimer}
              className={`flex items-center gap-1.5 font-mono font-semibold transition-all duration-200 ${
                timerEnabled ? 'text-accent' : 'text-muted hover:text-foreground'
              }`}
            >
              {timerEnabled ? (
                <>
                  {isRunning ? <Pause size={14} /> : <Play size={14} />}
                  {formatTime(seconds)}
                </>
              ) : (
                <>
                  <Timer size={14} />
                  <span className="text-xs tracking-wider">TIMER</span>
                </>
              )}
            </button>
            {timerEnabled && (
              <button
                id="workout-timer-stop"
                onClick={() => { reset(); setTimerEnabled(false); }}
                className="text-muted hover:text-danger transition-colors duration-200"
                title="Stop timer"
              >
                <Square size={14} fill="currentColor" />
              </button>
            )}
            <span id="workout-sets-count" className="flex items-center gap-1">
              <Check size={14} className="text-success" />
              {completedSets}/{totalSets} sets
            </span>
          </div>
        </div>
        <button
          id="cancel-workout-btn"
          onClick={cancelWorkout}
          aria-label={isEditing ? 'Discard changes' : 'Cancel workout'}
          className="p-3 rounded-xl bg-surface-elevated border border-border text-muted hover:text-danger hover:border-danger/30 transition-all duration-200 active:scale-95"
        >
          <X size={22} />
        </button>
      </header>

      {/* Rest Timer Toggle */}
      <button
        id="rest-timer-toggle"
        onClick={() => setShowRestTimer(!showRestTimer)}
        className={`w-full mb-5 py-4 px-5 rounded-xl border flex items-center justify-between transition-all duration-200 active:scale-[0.99] ${
          showRestTimer
            ? 'bg-accent/10 border-accent/30 text-accent'
            : 'bg-surface border-border text-muted hover:border-accent/20'
        }`}
      >
        <div className="flex items-center gap-3">
          <Timer size={22} />
          <span className="text-base font-medium">Rest Timer</span>
        </div>
        <ChevronDown
          size={22}
          className={`transition-transform duration-200 ${showRestTimer ? 'rotate-180' : ''}`}
        />
      </button>

      {showRestTimer && (
        <div id="rest-timer-container" className="mb-6 animate-scale-in">
          <RestTimer />
        </div>
      )}

      {/* Exercise List */}
      <div id="exercise-list" className="space-y-4 mb-6">
        {currentWorkout?.exercises.map((exercise, index) => (
          <div
            key={exercise.id}
            className="animate-slide-up opacity-0"
            style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
          >
            <ExerciseCard
              exercise={exercise}
              unit={unit}
              onUpdate={updateExercise}
              onRemove={() => removeExercise(exercise.id)}
            />
          </div>
        ))}
      </div>

      {/* Add Exercise Button */}
      <button
        id="add-exercise-btn"
        onClick={() => setShowExerciseModal(true)}
        className="group w-full py-6 rounded-2xl bg-surface border-2 border-dashed border-border hover:border-accent/50 hover:bg-surface-elevated transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.99]"
      >
        <div className="w-10 h-10 rounded-xl bg-surface-elevated group-hover:bg-accent/20 flex items-center justify-center transition-colors duration-200">
          <Plus size={22} className="text-muted group-hover:text-accent transition-colors duration-200" />
        </div>
        <span className="text-muted group-hover:text-foreground font-medium text-lg transition-colors duration-200">
          Add Exercise
        </span>
      </button>

      {/* Finish Button */}
      {currentWorkout && currentWorkout.exercises.length > 0 && (
        <div id="finish-btn-container" className="fixed bottom-28 left-6 right-6 max-w-lg mx-auto z-30">
          {saveError && (
            <div role="alert" className="mb-3 bg-bg/95 backdrop-blur border border-danger/40 text-danger rounded-xl px-4 py-3 text-sm flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{saveError}</span>
            </div>
          )}
          <button
            id="finish-workout-btn"
            onClick={finishWorkout}
            disabled={saving}
            className="group relative w-full active:scale-[0.98] transition-transform duration-150 disabled:opacity-80"
          >
            {/* Glow */}
            <div id="finish-btn-glow" className="absolute inset-0 bg-success/20 rounded-2xl blur-xl group-hover:bg-success/30 transition-all duration-300" />

            <div id="finish-btn-content" className="relative bg-gradient-to-r from-success to-success-dim rounded-2xl py-5 px-8 flex items-center justify-center gap-4 text-black font-semibold text-lg">
              {saving ? <Loader2 size={26} className="animate-spin" /> : <Check size={26} strokeWidth={2.5} />}
              <span className="font-display text-2xl tracking-wide">
                {saving ? 'SAVING' : saveError ? 'TRY AGAIN' : isEditing ? 'SAVE CHANGES' : 'FINISH WORKOUT'}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Exercise Modal */}
      {showExerciseModal && (
        <ExercisePicker
          onSelect={addExercises}
          onClose={() => setShowExerciseModal(false)}
        />
      )}
    </div>
  );
}
