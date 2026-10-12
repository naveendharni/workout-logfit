import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Search, Check, Timer, ChevronDown, Play, Pause, Square } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTimer, formatTime } from '../hooks/useTimer';
import type { Workout, WorkoutExercise, Exercise } from '../types';
import { exercises as exerciseList } from '../data/exercises';
import { generateId } from '../utils/storage';
import ExerciseCard from '../components/ExerciseCard';
import { RestTimer } from '../components/Timer';

export default function WorkoutPage() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>('workout-app-workouts', []);
  const [currentWorkout, setCurrentWorkout] = useLocalStorage<Workout | null>('workout-app-current', null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const { seconds, isRunning, start, pause, reset } = useTimer(0, false);

  useEffect(() => {
    if (!currentWorkout) {
      const newWorkout: Workout = {
        id: generateId(),
        date: new Date().toISOString(),
        duration: 0,
        exercises: [],
        completed: false,
      };
      setCurrentWorkout(newWorkout);
    }
  }, []);

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
      id: generateId(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: [{ id: generateId(), reps: 10, weight: 0, completed: false }],
    }));
    setCurrentWorkout({
      ...currentWorkout,
      exercises: [...currentWorkout.exercises, ...newExercises],
    });
    setShowExerciseModal(false);
  };

  const updateExercise = (updated: WorkoutExercise) => {
    if (!currentWorkout) return;
    setCurrentWorkout({
      ...currentWorkout,
      exercises: currentWorkout.exercises.map(e =>
        e.id === updated.id ? updated : e
      ),
    });
  };

  const removeExercise = (exerciseId: string) => {
    if (!currentWorkout) return;
    setCurrentWorkout({
      ...currentWorkout,
      exercises: currentWorkout.exercises.filter(e => e.id !== exerciseId),
    });
  };

  const finishWorkout = () => {
    if (!currentWorkout) return;
    if (timerEnabled) pause();
    const completedWorkout: Workout = {
      ...currentWorkout,
      duration: timerEnabled ? seconds : 0,
      completed: true,
    };
    setWorkouts([...workouts, completedWorkout]);
    setCurrentWorkout(null);
    reset();
    navigate('/');
  };

  const cancelWorkout = () => {
    if (confirm('Are you sure you want to cancel this workout?')) {
      setCurrentWorkout(null);
      reset();
      navigate('/');
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
            <h1 className="font-display text-3xl text-foreground tracking-wide">ACTIVE SESSION</h1>
            <div id="live-indicator" className="flex items-center gap-1.5 px-2 py-0.5 bg-accent/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-bold text-accent tracking-wider">LIVE</span>
            </div>
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
          <button
            id="finish-workout-btn"
            onClick={finishWorkout}
            className="group relative w-full active:scale-[0.98] transition-transform duration-150"
          >
            {/* Glow */}
            <div id="finish-btn-glow" className="absolute inset-0 bg-success/20 rounded-2xl blur-xl group-hover:bg-success/30 transition-all duration-300" />

            <div id="finish-btn-content" className="relative bg-gradient-to-r from-success to-success-dim rounded-2xl py-5 px-8 flex items-center justify-center gap-4 text-black font-semibold text-lg">
              <Check size={26} strokeWidth={2.5} />
              <span className="font-display text-2xl tracking-wide">FINISH WORKOUT</span>
            </div>
          </button>
        </div>
      )}

      {/* Exercise Modal */}
      {showExerciseModal && (
        <ExerciseModal
          onSelect={addExercises}
          onClose={() => setShowExerciseModal(false)}
        />
      )}
    </div>
  );
}

function ExerciseModal({
  onSelect,
  onClose,
}: {
  onSelect: (exercises: Exercise[]) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const categories = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];

  const filtered = exerciseList.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = () => {
    const exercises = exerciseList.filter(e => selected.has(e.id));
    onSelect(exercises);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-end animate-fade-in">
      <div className="w-full max-h-[90vh] bg-bg rounded-t-3xl overflow-hidden flex flex-col border-t border-border animate-slide-up">
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl text-foreground tracking-wide">ADD EXERCISE</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-surface-elevated border border-border text-muted hover:text-white hover:border-accent/30 transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="Search exercises..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl pl-11 pr-4 py-3.5 text-foreground placeholder-muted focus:border-accent/50 transition-colors duration-200"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`btn-pill whitespace-nowrap ${
                !selectedCategory
                  ? 'bg-accent text-black'
                  : 'bg-surface-elevated text-muted border border-border hover:border-accent/30 hover:text-foreground'
              }`}
            >
              ALL
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn-pill uppercase whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-accent text-black'
                    : 'bg-surface-elevated text-muted border border-border hover:border-accent/30 hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-2">
            {filtered.map((exercise, index) => {
              const isSelected = selected.has(exercise.id);
              return (
                <button
                  key={exercise.id}
                  onClick={() => toggleSelect(exercise.id)}
                  className={`group w-full text-left p-4 rounded-xl border transition-all duration-200 animate-fade-in opacity-0 ${
                    isSelected
                      ? 'bg-accent/10 border-accent/40'
                      : 'bg-surface border-border hover:border-accent/30 hover:bg-surface-elevated'
                  }`}
                  style={{ animationDelay: `${index * 0.02}s`, animationFillMode: 'forwards' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-semibold transition-colors duration-200 ${
                        isSelected ? 'text-accent' : 'text-foreground group-hover:text-accent'
                      }`}>
                        {exercise.name}
                      </p>
                      <p className="text-xs text-muted uppercase tracking-wider mt-0.5">{exercise.category}</p>
                    </div>
                    {isSelected ? (
                      <Check size={18} className="text-accent" />
                    ) : (
                      <Plus size={18} className="text-muted group-hover:text-accent transition-colors duration-200" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Add Selected Button */}
        {selected.size > 0 && (
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
