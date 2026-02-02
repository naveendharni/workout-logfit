import { useNavigate } from 'react-router-dom';
import { Play, Flame, Target, Trophy, Zap, ChevronRight } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Workout } from '../types';
import { calculateStats } from '../utils/storage';

export default function Home() {
  const navigate = useNavigate();
  const [workouts] = useLocalStorage<Workout[]>('workout-app-workouts', []);
  const stats = calculateStats(workouts);

  const lastWorkout = workouts
    .filter(w => w.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  return (
    <div id="home-page" className="min-h-screen p-6 max-w-lg mx-auto">
      {/* Header with dramatic typography */}
      <header id="home-header" className="mb-4 animate-slide-up opacity-0" style={{ animationDelay: '0s', animationFillMode: 'forwards' }}>
        <div id="status-indicator" className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-medium text-muted tracking-widest uppercase">Ready to train</span>
        </div>
        <h1 id="brand-title" className="text-5xl font-bold text-foreground leading-none tracking-tight">
          logfit<span className="text-accent">.</span>io
        </h1>
        <p id="tagline" className="text-muted mt-2 text-sm">Track your gains.</p>
      </header>

      {/* Hero Start Button */}
      <button
        id="start-workout-btn"
        onClick={() => navigate('/workout')}
        className="group relative w-full mb-4 animate-slide-up opacity-0"
        style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
      >
        {/* Glow effect */}
        <div id="btn-glow" className="absolute inset-0 bg-accent/20 rounded-2xl blur-xl group-hover:bg-accent/30 transition-all duration-300" />

        {/* Button content */}
        <div id="btn-content" className="relative bg-gradient-to-br from-accent to-accent-dim rounded-3xl p-6 flex items-center justify-between overflow-hidden">
          {/* Geometric accent */}
          <div id="accent-top" className="absolute top-0 right-0 w-40 h-40 bg-black/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div id="accent-bottom" className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div id="btn-text" className="relative z-10 text-left">
            <p className="font-display text-4xl text-black tracking-wide">START WORKOUT</p>
            <p className="text-black/60 text-base mt-2 font-medium">Begin a new session</p>
          </div>

          <div id="btn-icon" className="relative z-10 bg-black rounded-full p-5 group-hover:scale-110 transition-transform duration-200">
            <Play size={32} fill="white" className="text-white ml-0.5" />
          </div>
        </div>
      </button>

      {/* Stats Grid */}
      <div id="stats-grid" className="grid grid-cols-2 gap-4 mb-10">
        <StatCard
          id="stat-this-week"
          icon={<Flame size={18} />}
          value={stats.thisWeekWorkouts}
          label="THIS WEEK"
          color="#ff6b35"
          delay={0.15}
        />
        <StatCard
          id="stat-total-lifts"
          icon={<Target size={18} />}
          value={stats.totalWorkouts}
          label="TOTAL LIFTS"
          color="#00d4ff"
          delay={0.2}
        />
        <StatCard
          id="stat-total-sets"
          icon={<Trophy size={18} />}
          value={stats.totalSets}
          label="TOTAL SETS"
          color="#ffd000"
          delay={0.25}
        />
        <StatCard
          id="stat-volume"
          icon={<Zap size={18} />}
          value={`${(stats.totalVolume / 1000).toFixed(1)}k`}
          label="VOLUME LBS"
          color="#c8ff00"
          delay={0.3}
        />
      </div>

      {/* Last Workout Card */}
      {lastWorkout && (
        <div
          id="last-workout-section"
          className="animate-slide-up opacity-0"
          style={{ animationDelay: '0.35s', animationFillMode: 'forwards' }}
        >
          <div id="last-workout-header" className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted tracking-widest">LAST SESSION</span>
            <button
              id="view-all-btn"
              onClick={() => navigate('/history')}
              className="flex items-center gap-1 text-xs text-accent font-medium hover:underline"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div
            id="last-workout-card"
            className="group bg-surface border border-border rounded-xl p-5 hover:border-accent/30 transition-all duration-200 cursor-pointer"
            onClick={() => navigate('/history')}
          >
            <div id="last-workout-content" className="flex justify-between items-start">
              <div id="last-workout-info">
                <p className="font-semibold text-lg text-foreground">
                  {new Date(lastWorkout.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <div id="last-workout-stats" className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1.5 text-sm text-muted">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {lastWorkout.exercises.length} exercises
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-muted">
                    <div className="w-1.5 h-1.5 rounded-full bg-info" />
                    {lastWorkout.exercises.reduce((acc, e) => acc + e.sets.filter(s => s.completed).length, 0)} sets
                  </span>
                </div>
              </div>
              <ChevronRight size={20} className="text-muted group-hover:text-accent group-hover:translate-x-1 transition-all duration-200" />
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {workouts.length === 0 && (
        <div
          id="empty-state"
          className="text-center py-16 animate-fade-in opacity-0"
          style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
        >
          <div id="empty-icon" className="w-16 h-16 rounded-full bg-surface-elevated border border-border flex items-center justify-center mx-auto mb-4">
            <Flame size={28} className="text-muted" />
          </div>
          <p className="text-foreground font-medium mb-1">No workouts yet</p>
          <p className="text-sm text-muted">Start your first session to track progress</p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  id,
  icon,
  value,
  label,
  color,
  delay,
}: {
  id: string;
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
  delay: number;
}) {
  return (
    <div
      id={id}
      className="group bg-surface border border-border rounded-xl p-5 hover:border-accent/20 transition-all duration-200 animate-slide-up opacity-0"
      style={{ animationDelay: `${delay}s`, animationFillMode: 'forwards' }}
    >
      <div
        id={`${id}-icon`}
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {icon}
      </div>
      <p id={`${id}-value`} className="font-display text-4xl text-foreground leading-none">{value}</p>
      <p id={`${id}-label`} className="text-[11px] text-muted tracking-widest mt-2 font-medium">{label}</p>
    </div>
  );
}
