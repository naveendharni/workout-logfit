import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite">
      <div className="w-8 h-8 rounded-full border-2 border-border border-t-accent animate-spin" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

// Wraps the app's screens. Not logged in: go to /login, remembering where the user was headed.
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <FullScreenLoader />;
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

// Wraps /login and /signup. Already logged in: go to the app.
export function RedirectIfAuthenticated() {
  const { status } = useAuth();
  if (status === 'loading') return <FullScreenLoader />;
  if (status === 'authenticated') return <Navigate to="/" replace />;
  return <Outlet />;
}
