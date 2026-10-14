import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { ApiError } from '../lib/api';

export default function TryDemoButton() {
  const { startDemo } = useAuth();
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setStarting(true);
    setError(null);
    try {
      await startDemo();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start the demo. Check your connection.');
      setStarting(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={start}
        disabled={starting}
        className="w-full py-4 rounded-xl bg-surface border border-border text-foreground font-semibold flex items-center justify-center gap-2 hover:border-accent/40 transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        {starting ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="text-accent" />}
        {starting ? 'Setting up your demo' : 'Try the demo'}
      </button>
      <p className="text-xs text-muted text-center mt-2">No sign-up. Comes with 4 weeks of sample workouts.</p>
      {error && (
        <p role="alert" className="text-sm text-danger text-center mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
