import { createContext } from 'react';
import type { User } from '../lib/api';
import type { Unit } from '../types';

export type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'authenticated'; user: User }
  | { status: 'anonymous'; user: null };

export type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  startDemo: () => Promise<void>;
  setUnit: (unit: Unit) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
