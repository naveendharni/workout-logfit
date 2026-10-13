import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as api from '../lib/api';
import { AuthContext, type AuthState } from './auth-context';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null });

  // On app start, try the refresh cookie. If it's valid we're logged in without typing anything (silent refresh).
  useEffect(() => {
    let active = true;
    api.refreshSession().then((session) => {
      if (!active) return;
      setState(session ? { status: 'authenticated', user: session.user } : { status: 'anonymous', user: null });
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    api.setSessionLostHandler(() => setState({ status: 'anonymous', user: null }));
    return () => api.setSessionLostHandler(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const session = await api.login(email, password);
    setState({ status: 'authenticated', user: session.user });
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const session = await api.signup(email, password);
    setState({ status: 'authenticated', user: session.user });
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setState({ status: 'anonymous', user: null });
  }, []);

  const value = useMemo(() => ({ ...state, login, signup, logout }), [state, login, signup, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
