// All API calls go through here. The access token lives only in this module's memory:
// not in localStorage, not in a cookie, so injected scripts or browser extensions reading storage can't find it.
// It's lost on page reload, and the refresh cookie gets a new one.

export type User = { id: string; email: string; unit: 'KG' | 'LB' };

type Session = { accessToken: string; expiresIn: number; user: User };

export class ApiError extends Error {
  readonly status: number;
  readonly issues?: { path: string; message: string }[];

  constructor(status: number, message: string, issues?: { path: string; message: string }[]) {
    super(message);
    this.status = status;
    this.issues = issues;
  }
}

let accessToken: string | null = null;
let onSessionLost: (() => void) | null = null;

// Lets AuthProvider hear when a refresh fails mid-session, so it can send the user to log in.
export const setSessionLostHandler = (handler: (() => void) | null) => {
  onSessionLost = handler;
};

const parseError = async (res: Response) => {
  const body = await res.json().catch(() => null);
  return new ApiError(res.status, body?.error ?? `Request failed (${res.status})`, body?.issues);
};

const request = async (path: string, init: RequestInit = {}, token: string | null = accessToken) => {
  const headers = new Headers(init.headers);
  if (init.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  // Same origin, so the browser sends the refresh cookie to /api/auth without extra settings.
  return fetch(`/api${path}`, { ...init, headers, credentials: 'same-origin' });
};

let refreshInFlight: Promise<Session | null> | null = null;

const doRefresh = async (): Promise<Session | null> => {
  let res = await request('/auth/refresh', { method: 'POST' }, null);
  // 409: another tab or a double-mounted effect rotated the token a moment ago.
  // The browser already holds the new cookie, so one retry succeeds.
  if (res.status === 409) res = await request('/auth/refresh', { method: 'POST' }, null);
  if (!res.ok) {
    accessToken = null;
    return null;
  }
  const session = (await res.json()) as Session;
  accessToken = session.accessToken;
  return session;
};

// Several calls can hit a 401 at once. They all share one refresh instead of each rotating the token.
export const refreshSession = () => {
  refreshInFlight ??= doRefresh().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
};

// For app data calls. On 401 it refreshes the access token once and retries.
export const apiFetch = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  let res = await request(path, init);
  if (res.status === 401) {
    const session = await refreshSession();
    if (!session) {
      onSessionLost?.();
      throw new ApiError(401, 'Your session has ended. Please log in again.');
    }
    res = await request(path, init);
  }
  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
};

const authPost = async (path: string, body: unknown): Promise<Session> => {
  const res = await request(path, { method: 'POST', body: JSON.stringify(body) }, null);
  if (!res.ok) throw await parseError(res);
  const session = (await res.json()) as Session;
  accessToken = session.accessToken;
  return session;
};

export const signup = (email: string, password: string) => authPost('/auth/signup', { email, password });

export const login = (email: string, password: string) => authPost('/auth/login', { email, password });

export const logout = async () => {
  accessToken = null;
  await request('/auth/logout', { method: 'POST' }, null).catch(() => undefined);
};
