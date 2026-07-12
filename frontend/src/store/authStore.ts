import { create } from 'zustand';
import type { User } from '../types';
import * as authService from '../services/auth.ts';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, turnstileToken?: string) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  login: async (email, password, turnstileToken) => {
    const { user, token } = await authService.login(email, password, turnstileToken);
    localStorage.setItem('transitops_token', token);
    set({ user, token });
  },
  logout: () => {
    authService.logout();
    localStorage.removeItem('transitops_token');
    set({ user: null, token: null });
  },
  restoreSession: async () => {
    const token = localStorage.getItem('transitops_token');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const user = await authService.me();
      set({ user, token, isLoading: false });
    } catch (error) {
      localStorage.removeItem('transitops_token');
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
