import { useState } from 'react';
import { DownloadCloud, Loader2, X } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { ApiError, apiFetch } from '../lib/api';
import { clearLegacyWorkouts, dismissImport, isImportDismissed, readLegacyWorkouts } from '../lib/legacy';

// Offers to move workouts saved by the old browser-only version into the user's account.
export default function ImportBanner({ onImported }: { onImported: () => void }) {
  const { user } = useAuth();
  const [legacy] = useState(readLegacyWorkouts);
  const [hidden, setHidden] = useState(() => !user || isImportDismissed(user.id));
  const [status, setStatus] = useState<'idle' | 'importing' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!user || hidden || legacy.length === 0) return null;

  const runImport = async () => {
    setStatus('importing');
    try {
      const result = await apiFetch<{ imported: number; skipped: number }>('/workouts/import', {
        method: 'POST',
        body: JSON.stringify({ workouts: legacy }),
      });
      clearLegacyWorkouts();
      setStatus('done');
      setMessage(`Imported ${result.imported} workout${result.imported === 1 ? '' : 's'}.`);
      onImported();
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof ApiError ? err.message : 'Import failed. Your local workouts are still here, try again.');
    }
  };

  const dismiss = () => {
    dismissImport(user.id);
    setHidden(true);
  };

  return (
    <section
      aria-label="Import workouts"
      className="mb-4 bg-info/5 border border-info/30 rounded-2xl p-5 animate-slide-up opacity-0"
      style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}
    >
      <div className="flex items-start gap-3">
        <DownloadCloud size={22} className="text-info shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          {status === 'done' ? (
            <p className="text-sm text-foreground" role="status">
              {message}
            </p>
          ) : (
            <>
              <p className="font-semibold text-foreground">
                {legacy.length} workout{legacy.length === 1 ? '' : 's'} found on this device
              </p>
              <p className="text-sm text-muted mt-1">Import them into your account so they sync everywhere. Weights were logged in lbs.</p>
              {status === 'error' && (
                <p role="alert" className="text-sm text-danger mt-2">
                  {message}
                </p>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={runImport}
                  disabled={status === 'importing'}
                  className="px-4 py-2.5 rounded-xl bg-info text-black text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
                >
                  {status === 'importing' && <Loader2 size={14} className="animate-spin" />}
                  {status === 'importing' ? 'Importing' : 'Import'}
                </button>
                <button
                  onClick={dismiss}
                  disabled={status === 'importing'}
                  className="px-4 py-2.5 rounded-xl bg-surface-elevated border border-border text-sm text-muted hover:text-foreground"
                >
                  Not now
                </button>
              </div>
            </>
          )}
        </div>
        {status === 'done' && (
          <button onClick={() => setHidden(true)} aria-label="Close" className="p-1 text-muted hover:text-foreground">
            <X size={16} />
          </button>
        )}
      </div>
    </section>
  );
}
