import { useId, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { ApiError } from '../lib/api';
import TryDemoButton from './TryDemoButton';

type Props = {
  mode: 'login' | 'signup';
  onSubmit: (email: string, password: string) => Promise<void>;
};

const copy = {
  login: {
    title: 'LOG IN',
    subtitle: 'Welcome back. Pick up where you left off.',
    submit: 'Log in',
    passwordHint: undefined,
    autoComplete: 'current-password',
    switchText: 'New here?',
    switchLink: 'Create an account',
    switchTo: '/signup',
  },
  signup: {
    title: 'SIGN UP',
    subtitle: 'Create an account to keep your workouts on every device.',
    submit: 'Create account',
    passwordHint: 'At least 8 characters',
    autoComplete: 'new-password',
    switchText: 'Already have an account?',
    switchLink: 'Log in',
    switchTo: '/login',
  },
} as const;

const inputClass =
  'w-full bg-surface border border-border rounded-xl px-4 py-3.5 text-foreground placeholder-muted focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 transition-colors duration-200 aria-[invalid=true]:border-danger/60';

export default function AuthForm({ mode, onSubmit }: Props) {
  const text = copy[mode];
  const id = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      await onSubmit(email, password);
    } catch (err) {
      if (err instanceof ApiError && err.issues?.length) {
        setFieldErrors(Object.fromEntries(err.issues.map((issue) => [issue.path, issue.message])));
      } else {
        setError(err instanceof ApiError ? err.message : 'Could not reach the server. Check your connection.');
      }
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-lg mx-auto flex flex-col justify-center">
      <header className="mb-8 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
        <p className="text-3xl font-bold text-foreground leading-none tracking-tight mb-6">
          logfit<span className="text-accent">.</span>io
        </p>
        <h1 className="font-display text-5xl text-foreground leading-none">
          {text.title}
          <span className="text-accent">.</span>
        </h1>
        <p className="text-muted mt-2 text-sm">{text.subtitle}</p>
      </header>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4 animate-slide-up opacity-0"
        style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
      >
        {error && (
          <div role="alert" className="bg-danger/10 border border-danger/30 text-danger rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor={`${id}-email`} className="block text-xs font-semibold text-muted tracking-widest uppercase mb-2">
            Email
          </label>
          <input
            id={`${id}-email`}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? `${id}-email-error` : undefined}
            className={inputClass}
            placeholder="you@example.com"
          />
          {fieldErrors.email && (
            <p id={`${id}-email-error`} className="text-danger text-xs mt-1.5">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${id}-password`} className="block text-xs font-semibold text-muted tracking-widest uppercase mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id={`${id}-password`}
              type={showPassword ? 'text' : 'password'}
              autoComplete={text.autoComplete}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                [fieldErrors.password && `${id}-password-error`, text.passwordHint && `${id}-password-hint`]
                  .filter(Boolean)
                  .join(' ') || undefined
              }
              className={`${inputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {text.passwordHint && !fieldErrors.password && (
            <p id={`${id}-password-hint`} className="text-muted text-xs mt-1.5">
              {text.passwordHint}
            </p>
          )}
          {fieldErrors.password && (
            <p id={`${id}-password-error`} className="text-danger text-xs mt-1.5">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="group w-full mt-2 bg-gradient-to-br from-accent to-accent-dim text-black font-semibold rounded-xl py-4 flex items-center justify-center gap-2 transition-all duration-200 hover:glow-accent-subtle active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Please wait
            </>
          ) : (
            <>
              {text.submit} <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 animate-fade-in opacity-0" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
        <div className="flex items-center gap-3 mb-6" aria-hidden="true">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] font-semibold text-muted tracking-widest">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <TryDemoButton />
      </div>

      <p className="text-sm text-muted text-center mt-8 animate-fade-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
        {text.switchText}{' '}
        <Link to={text.switchTo} className="text-accent font-medium hover:underline focus:outline-none focus-visible:underline">
          {text.switchLink}
        </Link>
      </p>
    </div>
  );
}
