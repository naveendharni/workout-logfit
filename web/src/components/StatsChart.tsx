import type { Stats, Unit } from '../types';
import { formatVolume, unitLabel } from '../lib/units';

interface StatsChartProps {
  days: Stats['days'];
  unit: Unit;
  range?: number;
}

// Local calendar date as YYYY-MM-DD (en-CA formats dates that way), matching the server's per-day buckets.
const localDate = (date: Date) => date.toLocaleDateString('en-CA');

export default function StatsChart({ days, unit, range = 7 }: StatsChartProps) {
  const now = new Date();
  const today = localDate(now);
  const byDate = new Map(days.map((d) => [d.date, d]));

  const data = Array.from({ length: range }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (range - 1 - i));
    const key = localDate(date);
    const day = byDate.get(key);
    return {
      date: key,
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      volume: day?.volumeKg ?? 0,
      hasWorkout: (day?.workouts ?? 0) > 0,
    };
  });

  const maxVolume = Math.max(...data.map((d) => d.volume), 1);
  const totalVolume = data.reduce((acc, d) => acc + d.volume, 0);
  const activeDays = data.filter((d) => d.hasWorkout).length;
  const label = unitLabel(unit);

  return (
    <div className="bg-surface rounded-2xl p-5 border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[10px] text-muted tracking-widest uppercase mb-1">WEEKLY VOLUME</h3>
          <p className="font-display text-2xl text-foreground">
            {formatVolume(totalVolume, unit)} <span className="text-sm text-muted">{label}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted tracking-widest uppercase mb-1">ACTIVE DAYS</p>
          <p className="font-display text-2xl text-accent">
            {activeDays}
            <span className="text-sm text-muted">/{range}</span>
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end justify-between gap-2 h-32" role="img" aria-label={`Volume per day for the last ${range} days`}>
        {data.map(({ date, volume, label: dayLabel, hasWorkout }) => {
          const heightPercent = (volume / maxVolume) * 100;
          const isToday = date === today;

          return (
            <div key={date} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="w-full flex flex-col items-center justify-end h-24 relative">
                {/* Hover tooltip */}
                {volume > 0 && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-elevated border border-border rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    <span className="text-xs font-mono text-accent">
                      {formatVolume(volume, unit)} {label}
                    </span>
                  </div>
                )}

                {/* Bar */}
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 ease-out ${
                    hasWorkout ? 'bg-gradient-to-t from-accent to-accent-dim' : 'bg-border'
                  } ${isToday ? 'ring-2 ring-accent/30 ring-offset-2 ring-offset-surface' : ''}`}
                  style={{
                    height: hasWorkout ? `${Math.max(heightPercent, 8)}%` : '4px',
                    minHeight: hasWorkout ? '8px' : '4px',
                  }}
                />
              </div>

              {/* Day label */}
              <span
                className={`text-[10px] font-medium tracking-wider ${
                  isToday ? 'text-accent' : hasWorkout ? 'text-foreground' : 'text-muted'
                }`}
              >
                {dayLabel.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
