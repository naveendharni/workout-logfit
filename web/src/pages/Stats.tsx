import { Trophy, Flame, Target, TrendingUp, Zap } from 'lucide-react';
import type { Stats as StatsData } from '../types';
import StatsChart from '../components/StatsChart';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../auth/useAuth';
import { formatVolume, formatWeight, unitLabel } from '../lib/units';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';

// The browser's time zone, so "today" and each chart bar match the user's calendar.
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export default function Stats() {
  const { user } = useAuth();
  const unit = user?.unit ?? 'KG';
  const { data: stats, error, loading, reload } = useApi<StatsData>(`/stats?tz=${encodeURIComponent(timeZone)}`);
  const personalRecords = stats?.personalRecords ?? [];

  return (
    <div id="stats-page" className="min-h-screen px-6 pt-14 pb-10 max-w-lg mx-auto">
      {/* Header */}
      <header id="stats-header" className="mb-8 animate-slide-up opacity-0" style={{ animationDelay: '0s', animationFillMode: 'forwards' }}>
        <div id="stats-status" className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-gold" />
          <span className="text-xs font-medium text-muted tracking-widest uppercase">Analytics</span>
        </div>
        <h1 id="stats-title" className="font-display text-5xl text-foreground leading-none">
          STATS<span className="text-accent">.</span>
        </h1>
      </header>

      {loading && !stats ? (
        <LoadingState label="Crunching your numbers" />
      ) : error && !stats ? (
        <ErrorState message="Couldn't load your stats." onRetry={reload} />
      ) : stats && stats.totalWorkouts === 0 ? (
        <EmptyState icon={<TrendingUp size={28} />} title="No stats yet" text="Complete workouts to see your progress" />
      ) : stats ? (
        <>
      {/* Stats Grid */}
      <div id="stats-grid" className="grid grid-cols-2 gap-3 mb-8">
        <StatCard
          icon={<Flame size={18} />}
          value={stats.thisWeekWorkouts}
          label="THIS WEEK"
          color="#ff6b35"
          delay={0.1}
        />
        <StatCard
          icon={<Target size={18} />}
          value={stats.totalWorkouts}
          label="TOTAL LIFTS"
          color="#00d4ff"
          delay={0.15}
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          value={formatVolume(stats.totalVolumeKg, unit)}
          label={`VOLUME ${unitLabel(unit).toUpperCase()}`}
          color="#c8ff00"
          delay={0.2}
        />
        <StatCard
          icon={<Zap size={18} />}
          value={stats.totalSets}
          label="TOTAL SETS"
          color="#ffd000"
          delay={0.25}
        />
      </div>

      {/* Chart */}
      <div
        id="stats-chart-container"
        className="mb-8 animate-slide-up opacity-0"
        style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
      >
        <StatsChart days={stats.days} unit={unit} />
      </div>

      {/* Personal Records */}
      {personalRecords.length > 0 && (
        <div
          id="personal-records-section"
          className="animate-slide-up opacity-0"
          style={{ animationDelay: '0.35s', animationFillMode: 'forwards' }}
        >
          <div id="personal-records-header" className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
              <Trophy size={16} className="text-gold" />
            </div>
            <h2 className="font-display text-xl text-foreground tracking-wide">PERSONAL RECORDS</h2>
          </div>

          <div id="personal-records-list" className="space-y-2">
            {personalRecords.map((pr, index) => (
              <div
                key={pr.exercise}
                className="group bg-surface rounded-xl p-4 border border-border flex items-center justify-between hover:border-gold/30 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-warning/20 flex items-center justify-center">
                    <span className="font-display text-lg text-gold">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{pr.exercise}</p>
                    <p className="text-xs text-muted">Best set</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl text-accent">{formatWeight(pr.weightKg, unit)}<span className="text-sm text-muted ml-1">{unitLabel(unit)}</span></p>
                  <p className="text-xs text-muted">× {pr.reps} reps</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

        </>
      ) : null}
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
  delay,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
  delay: number;
}) {
  return (
    <div
      className="group bg-surface border border-border rounded-xl p-4 hover:border-accent/20 transition-all duration-200 animate-slide-up opacity-0"
      style={{ animationDelay: `${delay}s`, animationFillMode: 'forwards' }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {icon}
      </div>
      <p className="font-display text-3xl text-foreground leading-none">{value}</p>
      <p className="text-[10px] text-muted tracking-widest mt-1.5 font-medium">{label}</p>
    </div>
  );
}
