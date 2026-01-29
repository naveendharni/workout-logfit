import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTimer, formatTime } from '../hooks/useTimer';

interface TimerProps {
  initialSeconds?: number;
  countDown?: boolean;
  label?: string;
  onComplete?: () => void;
}

export default function Timer({
  initialSeconds = 0,
  countDown = false,
  label = 'Timer',
  onComplete
}: TimerProps) {
  const { seconds, isRunning, start, pause, reset } = useTimer(initialSeconds, countDown);

  const handleToggle = () => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  };

  if (countDown && seconds === 0 && onComplete) {
    onComplete();
  }

  return (
    <div id="timer-container" className="bg-[#111111] rounded-2xl p-6 border border-[#252525]">
      <p id="timer-label" className="text-[#737373] text-xs tracking-widest uppercase mb-4">{label}</p>
      <div id="timer-content" className="flex items-center justify-between">
        <span id="timer-display" className="font-mono text-5xl font-bold text-[#fafafa]">
          {formatTime(seconds)}
        </span>
        <div id="timer-controls" className="flex gap-3">
          <button
            id="timer-toggle-btn"
            onClick={handleToggle}
            className={`p-4 rounded-xl transition-all duration-200 active:scale-95 ${
              isRunning
                ? 'bg-[#c8ff00]/20 text-[#c8ff00]'
                : 'bg-[#c8ff00] text-black'
            }`}
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
          </button>
          <button
            id="timer-reset-btn"
            onClick={reset}
            className="p-4 rounded-xl bg-[#1a1a1a] border border-[#252525] text-[#737373] hover:text-[#fafafa] hover:border-[#c8ff00]/30 transition-all duration-200 active:scale-95"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

interface RestTimerProps {
  onComplete?: () => void;
}

export function RestTimer(_props: RestTimerProps) {
  const presets = [30, 60, 90, 120];
  const { seconds, isRunning, start, pause, reset, setTime } = useTimer(60, true);

  const handlePreset = (time: number) => {
    setTime(time);
    start();
  };

  const progress = seconds / 120;

  return (
    <div id="rest-timer" className="bg-[#111111] rounded-2xl p-6 border border-[#252525] overflow-hidden relative">
      {/* Progress bar background */}
      <div id="rest-timer-progress-bg" className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#c8ff00]/20">
        <div
          id="rest-timer-progress-bar"
          className="h-full bg-[#c8ff00] transition-all duration-1000 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <p id="rest-timer-label" className="text-[#737373] text-xs tracking-widest uppercase mb-5">REST TIMER</p>

      {/* Timer Display */}
      <div id="rest-timer-display" className="text-center mb-8">
        <span className={`font-mono text-7xl font-bold transition-colors duration-300 ${
          seconds <= 10 && seconds > 0 ? 'text-[#ff6b35]' : 'text-[#c8ff00]'
        }`}>
          {formatTime(seconds)}
        </span>
      </div>

      {/* Presets */}
      <div id="rest-timer-presets" className="grid grid-cols-4 gap-3 mb-5">
        {presets.map(time => (
          <button
            key={time}
            onClick={() => handlePreset(time)}
            className="py-4 rounded-xl bg-[#1a1a1a] border border-[#252525] hover:border-[#c8ff00]/30 hover:bg-[#252525] text-[#fafafa] text-base font-mono font-semibold transition-all duration-200 active:scale-95"
          >
            {time}s
          </button>
        ))}
      </div>

      {/* Controls */}
      <div id="rest-timer-controls" className="flex gap-3">
        <button
          id="rest-timer-toggle-btn"
          onClick={isRunning ? pause : start}
          className={`flex-1 py-5 rounded-xl font-semibold text-base tracking-wider transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.98] ${
            isRunning
              ? 'bg-[#c8ff00]/20 text-[#c8ff00] border border-[#c8ff00]/30'
              : 'bg-[#c8ff00] text-black'
          }`}
        >
          {isRunning ? (
            <>
              <Pause size={22} />
              PAUSE
            </>
          ) : (
            <>
              <Play size={22} className="ml-0.5" />
              START
            </>
          )}
        </button>
        <button
          id="rest-timer-reset-btn"
          onClick={reset}
          className="px-6 py-5 rounded-xl bg-[#1a1a1a] border border-[#252525] text-[#737373] hover:text-[#fafafa] hover:border-[#c8ff00]/30 transition-all duration-200 active:scale-95"
        >
          <RotateCcw size={22} />
        </button>
      </div>
    </div>
  );
}
