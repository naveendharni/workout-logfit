import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Search, Check, Timer, ChevronDown } from 'lucide-react';
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
      start();
    } else if (!isRunning) {
      start();
    }
  }, []);

  const addExercise = (exercise: Exercise) => {
    if (!currentWorkout) return;
    const newExercise: WorkoutExercise = {
      id: generateId(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: [{ id: generateId(), reps: 10, weight: 0, completed: false }],
    };
    setCurrentWorkout({
      ...currentWorkout,
      exercises: [...currentWorkout.exercises, newExercise],
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
    pause();
    const completedWorkout: Workout = {
      ...currentWorkout,
      duration: seconds,
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
            <h1 className="font-display text-3xl text-[#fafafa] tracking-wide">ACTIVE SESSION</h1>
            <div id="live-indicator" className="flex items-center gap-1.5 px-2 py-0.5 bg-[#c8ff00]/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-[#c8ff00] animate-pulse" />
              <span className="text-[10px] font-bold text-[#c8ff00] tracking-wider">LIVE</span>
            </div>
          </div>
          <div id="workout-stats" className="flex items-center gap-4 text-sm text-[#737373]">
            <span id="workout-timer" className="font-mono text-[#c8ff00] font-semibold">{formatTime(seconds)}</span>
            <span id="workout-sets-count" className="flex items-center gap-1">
              <Check size={14} className="text-[#00ff88]" />
              {completedSets}/{totalSets} sets
            </span>
          </div>
        </div>
        <button
          id="cancel-workout-btn"
          onClick={cancelWorkout}
          className="p-3 rounded-xl bg-[#1a1a1a] border border-[#252525] text-[#737373] hover:text-[#ff3b3b] hover:border-[#ff3b3b]/30 transition-all duration-200 active:scale-95"
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
            ? 'bg-[#c8ff00]/10 border-[#c8ff00]/30 text-[#c8ff00]'
            : 'bg-[#111111] border-[#252525] text-[#737373] hover:border-[#c8ff00]/20'
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
        className="group w-full py-6 rounded-2xl bg-[#111111] border-2 border-dashed border-[#252525] hover:border-[#c8ff00]/50 hover:bg-[#1a1a1a] transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.99]"
      >
        <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] group-hover:bg-[#c8ff00]/20 flex items-center justify-center transition-colors duration-200">
          <Plus size={22} className="text-[#737373] group-hover:text-[#c8ff00] transition-colors duration-200" />
        </div>
        <span className="text-[#737373] group-hover:text-[#fafafa] font-medium text-lg transition-colors duration-200">
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
            <div id="finish-btn-glow" className="absolute inset-0 bg-[#00ff88]/20 rounded-2xl blur-xl group-hover:bg-[#00ff88]/30 transition-all duration-300" />

            <div id="finish-btn-content" className="relative bg-gradient-to-r from-[#00ff88] to-[#00cc6a] rounded-2xl py-5 px-8 flex items-center justify-center gap-4 text-black font-semibold text-lg">
              <Check size={26} strokeWidth={2.5} />
              <span className="font-display text-2xl tracking-wide">FINISH WORKOUT</span>
            </div>
          </button>
        </div>
      )}

      {/* Exercise Modal */}
      {showExerciseModal && (
        <ExerciseModal
          onSelect={addExercise}
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
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];

  const filtered = exerciseList.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-end animate-fade-in">
      <div className="w-full max-h-[90vh] bg-[#0a0a0a] rounded-t-3xl overflow-hidden flex flex-col border-t border-[#252525] animate-slide-up">
        {/* Header */}
        <div className="p-5 border-b border-[#252525]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl text-[#fafafa] tracking-wide">ADD EXERCISE</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1a1a1a] border border-[#252525] text-[#737373] hover:text-white hover:border-[#c8ff00]/30 transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737373]" size={18} />
            <input
              type="text"
              placeholder="Search exercises..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#111111] border border-[#252525] rounded-xl pl-11 pr-4 py-3.5 text-[#fafafa] placeholder-[#737373] focus:border-[#c8ff00]/50 transition-colors duration-200"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider whitespace-nowrap transition-all duration-200 ${
                !selectedCategory
                  ? 'bg-[#c8ff00] text-black'
                  : 'bg-[#1a1a1a] text-[#737373] border border-[#252525] hover:border-[#c8ff00]/30 hover:text-[#fafafa]'
              }`}
            >
              ALL
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-[#c8ff00] text-black'
                    : 'bg-[#1a1a1a] text-[#737373] border border-[#252525] hover:border-[#c8ff00]/30 hover:text-[#fafafa]'
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
            {filtered.map((exercise, index) => (
              <button
                key={exercise.id}
                onClick={() => onSelect(exercise)}
                className="group w-full text-left p-4 rounded-xl bg-[#111111] border border-[#252525] hover:border-[#c8ff00]/30 hover:bg-[#1a1a1a] transition-all duration-200 animate-fade-in opacity-0"
                style={{ animationDelay: `${index * 0.02}s`, animationFillMode: 'forwards' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#fafafa] group-hover:text-[#c8ff00] transition-colors duration-200">
                      {exercise.name}
                    </p>
                    <p className="text-xs text-[#737373] uppercase tracking-wider mt-0.5">{exercise.category}</p>
                  </div>
                  <Plus size={18} className="text-[#737373] group-hover:text-[#c8ff00] transition-colors duration-200" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
