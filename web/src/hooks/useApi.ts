import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

type State<T> = { key: string | null; data?: T; error?: Error };

// Loads a GET endpoint. Returns loading, error and data, plus reload() for retry buttons and refreshes.
// Data from the previous load stays visible while reloading, so screens don't flash empty.
export function useApi<T>(path: string | null) {
  const [version, setVersion] = useState(0);
  const key = path ? `${path}#${version}` : null;
  const [state, setState] = useState<State<T>>({ key: null });

  useEffect(() => {
    if (!path || !key) return;
    let active = true;
    apiFetch<T>(path).then(
      (data) => active && setState({ key, data }),
      (error: Error) => active && setState((prev) => ({ key, data: prev.data, error })),
    );
    return () => {
      active = false;
    };
  }, [path, key]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return {
    data: state.data,
    error: state.key === key ? state.error : undefined,
    loading: key !== null && state.key !== key,
    reload,
  };
}
