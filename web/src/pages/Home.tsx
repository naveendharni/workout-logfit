import { useNavigate } from 'react-router-dom';
import { Play, Flame, ChevronRight, LogOut } from 'lucide-react';
import type { Workout } from '../types';
import { useAuth } from '../auth/useAuth';
import { useApi } from '../hooks/useApi';
import { readDraft } from '../lib/draft';
import ImportBanner from '../components/ImportBanner';
import UnitToggle from '../components/UnitToggle';
import { ErrorState } from '../components/StateViews';
export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data, error, loading, reload } = useApi<{ workouts: Workout[] }>('/workouts?limit=1');
  const lastWorkout = data?.workouts[0];
  const hasDraft = Boolean(user && readDraft(user.id)?.exercises.length);

  return (
    <div id="home-page" className="min-h-screen p-6 max-w-lg mx-auto">
      {/* Header with dramatic typography */}
      <header id="home-header" className="mb-4 animate-slide-up opacity-0" style={{ animationDelay: '0s', animationFillMode: 'forwards' }}>
        <div className="flex items-center justify-between gap-3 mb-1">
          <div id="status-indicator" className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
            <span className="text-xs font-medium text-muted tracking-widest uppercase truncate">Ready to train</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <UnitToggle />
            <button
              id="logout-btn"
              onClick={logout}
              aria-label="Log out"
              className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-elevated transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
        <h1 id="brand-title" className="text-5xl font-bold text-foreground leading-none tracking-tight">
          logfit<span className="text-accent">.</span>io
        </h1>
        <p id="tagline" className="text-muted mt-2 text-sm">Track your gains.</p>
        {user?.isDemo ? (
          <p className="text-xs text-info mt-1">Demo account. Explore freely, it's deleted after 7 days.</p>
        ) : (
          <p className="text-xs text-muted/80 mt-1 truncate">Signed in as {user?.email}</p>
        )}
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
            <p className="font-display text-4xl text-black tracking-wide">{hasDraft ? 'RESUME WORKOUT' : 'START WORKOUT'}</p>
            <p className="text-black/60 text-base mt-2 font-medium">{hasDraft ? 'Pick up your session' : 'Begin a new session'}</p>
          </div>

          <div id="btn-icon" className="relative z-10 bg-black rounded-full p-5 group-hover:scale-110 transition-transform duration-200">
            <Play size={32} fill="white" className="text-white ml-0.5" />
          </div>
        </div>
      </button>

      <ImportBanner onImported={reload} />

      {/* Last session: loading and error states */}
      {loading && !data && (
        <div className="h-28 rounded-xl bg-surface border border-border animate-pulse" role="status" aria-label="Loading last session" />
      )}
      {error && !data && <ErrorState message="Couldn't load your last session." onRetry={reload} />}

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
                  {new Date(lastWorkout.startedAt).toLocaleDateString('en-US', {
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
      {data && !lastWorkout && (
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
