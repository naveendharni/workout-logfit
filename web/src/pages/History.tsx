import { useState } from 'react';
import { Calendar, Clock, Dumbbell, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Workout } from '../types';
import { formatTime } from '../hooks/useTimer';

export default function History() {
  const [workouts] = useLocalStorage<Workout[]>('workout-app-workouts', []);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sortedWorkouts = [...workouts]
    .filter(w => w.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

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

      {/* Stats Summary */}
      {sortedWorkouts.length > 0 && (
        <div
          id="history-stats-summary"
          className="grid grid-cols-3 gap-3 mb-8 animate-slide-up opacity-0"
          style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
        >
          <div id="history-stat-sessions" className="bg-surface border border-border rounded-xl p-4 text-center">
            <p className="font-display text-2xl text-accent">{sortedWorkouts.length}</p>
            <p className="text-[10px] text-muted tracking-widest">SESSIONS</p>
          </div>
          <div id="history-stat-exercises" className="bg-surface border border-border rounded-xl p-4 text-center">
            <p className="font-display text-2xl text-info">
              {sortedWorkouts.reduce((acc, w) => acc + w.exercises.length, 0)}
            </p>
            <p className="text-[10px] text-muted tracking-widest">EXERCISES</p>
          </div>
          <div id="history-stat-sets" className="bg-surface border border-border rounded-xl p-4 text-center">
            <p className="font-display text-2xl text-warning">
              {sortedWorkouts.reduce((acc, w) =>
                acc + w.exercises.reduce((eAcc, e) => eAcc + e.sets.filter(s => s.completed).length, 0), 0
              )}
            </p>
            <p className="text-[10px] text-muted tracking-widest">TOTAL SETS</p>
          </div>
        </div>
      )}

      {/* Workout List */}
      {sortedWorkouts.length === 0 ? (
        <div
          id="history-empty-state"
          className="text-center py-20 animate-fade-in opacity-0"
          style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
        >
          <div id="history-empty-icon" className="w-16 h-16 rounded-full bg-surface-elevated border border-border flex items-center justify-center mx-auto mb-4">
            <Calendar size={28} className="text-muted" />
          </div>
          <p className="text-foreground font-medium mb-1">No workout history</p>
          <p className="text-sm text-muted">Complete a workout to see it here</p>
        </div>
      ) : (
        <div id="workout-list" className="space-y-3">
          {sortedWorkouts.map((workout, index) => (
            <div
              key={workout.id}
              className="animate-slide-up opacity-0"
              style={{ animationDelay: `${0.15 + index * 0.05}s`, animationFillMode: 'forwards' }}
            >
              <WorkoutCard
                workout={workout}
                expanded={expandedId === workout.id}
                onToggle={() => toggleExpand(workout.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WorkoutCard({
  workout,
  expanded,
  onToggle,
}: {
  workout: Workout;
  expanded: boolean;
  onToggle: () => void;
}) {
  const totalSets = workout.exercises.reduce(
    (acc, e) => acc + e.sets.filter(s => s.completed).length,
    0
  );

  const totalVolume = workout.exercises.reduce((acc, e) => {
    return acc + e.sets.reduce((setAcc, s) => {
      return setAcc + (s.completed ? s.reps * s.weight : 0);
    }, 0);
  }, 0);

  const date = new Date(workout.date);

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-accent/20 transition-all duration-200">
      <button
        onClick={onToggle}
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
              <span className="font-mono">{formatTime(workout.duration)}</span>
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
              <p className="font-display text-2xl text-foreground">{totalVolume.toLocaleString()}<span className="text-sm text-muted ml-1">lbs</span></p>
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
                        <span className="font-mono text-foreground">{set.weight}<span className="text-muted ml-0.5">lbs</span></span>
                        <span className="text-muted">×</span>
                        <span className="font-mono text-accent">{set.reps}<span className="text-muted ml-0.5">reps</span></span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
