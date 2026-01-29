import type { Workout } from '../types';

interface StatsChartProps {
  workouts: Workout[];
  days?: number;
}

export default function StatsChart({ workouts, days = 7 }: StatsChartProps) {
  const now = new Date();
  const data: { date: string; volume: number; label: string; hasWorkout: boolean }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });

    const dayWorkouts = workouts.filter(w => {
      const wDate = new Date(w.date).toISOString().split('T')[0];
      return wDate === dateStr && w.completed;
    });

    let volume = 0;
    dayWorkouts.forEach(w => {
      w.exercises.forEach(e => {
        e.sets.forEach(s => {
          if (s.completed) {
            volume += s.reps * s.weight;
          }
        });
      });
    });

    data.push({ date: dateStr, volume, label: dayLabel, hasWorkout: dayWorkouts.length > 0 });
  }

  const maxVolume = Math.max(...data.map(d => d.volume), 1);
  const totalVolume = data.reduce((acc, d) => acc + d.volume, 0);
  const activeDays = data.filter(d => d.hasWorkout).length;

  return (
    <div className="bg-[#111111] rounded-2xl p-5 border border-[#252525]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[10px] text-[#737373] tracking-widest uppercase mb-1">WEEKLY VOLUME</h3>
          <p className="font-display text-2xl text-[#fafafa]">
            {(totalVolume / 1000).toFixed(1)}k <span className="text-sm text-[#737373]">lbs</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-[#737373] tracking-widest uppercase mb-1">ACTIVE DAYS</p>
          <p className="font-display text-2xl text-[#c8ff00]">{activeDays}<span className="text-sm text-[#737373]">/{days}</span></p>
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end justify-between gap-2 h-32">
        {data.map(({ date, volume, label, hasWorkout }) => {
          const heightPercent = maxVolume > 0 ? (volume / maxVolume) * 100 : 0;
          const isToday = date === now.toISOString().split('T')[0];

          return (
            <div key={date} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="w-full flex flex-col items-center justify-end h-24 relative">
                {/* Hover tooltip */}
                {volume > 0 && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-[#252525] rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    <span className="text-xs font-mono text-[#c8ff00]">{volume.toLocaleString()} lbs</span>
                  </div>
                )}

                {/* Bar */}
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 ease-out ${
                    hasWorkout
                      ? 'bg-gradient-to-t from-[#c8ff00] to-[#9fcc00]'
                      : 'bg-[#252525]'
                  } ${isToday ? 'ring-2 ring-[#c8ff00]/30 ring-offset-2 ring-offset-[#111111]' : ''}`}
                  style={{
                    height: hasWorkout ? `${Math.max(heightPercent, 8)}%` : '4px',
                    minHeight: hasWorkout ? '8px' : '4px',
                  }}
                />
              </div>

              {/* Day label */}
              <span className={`text-[10px] font-medium tracking-wider ${
                isToday ? 'text-[#c8ff00]' : hasWorkout ? 'text-[#fafafa]' : 'text-[#737373]'
              }`}>
                {label.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
