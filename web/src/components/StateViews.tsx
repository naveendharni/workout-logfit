import type { ReactNode } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3" role="status" aria-live="polite">
      <div className="w-8 h-8 rounded-full border-2 border-border border-t-accent animate-spin" />
      <span className="text-sm text-muted">{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="bg-danger/5 border border-danger/30 rounded-2xl p-5 flex flex-col items-center text-center gap-3">
      <AlertTriangle size={24} className="text-danger" />
      <p className="text-sm text-foreground">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-elevated border border-border text-sm font-medium text-foreground hover:border-accent/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <RotateCw size={14} /> Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon, title, text, children }: { icon: ReactNode; title: string; text: string; children?: ReactNode }) {
  return (
    <div className="text-center py-16 animate-fade-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
      <div className="w-16 h-16 rounded-full bg-surface-elevated border border-border flex items-center justify-center mx-auto mb-4 text-muted">
        {icon}
      </div>
      <p className="text-foreground font-medium mb-1">{title}</p>
      <p className="text-sm text-muted">{text}</p>
      {children}
    </div>
  );
}
