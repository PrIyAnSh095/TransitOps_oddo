import { apiCall } from './api';
import type { User } from '../types';

interface LoginResponse {
  token: string;
  user: User;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiCall<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(): Promise<void> {
  return apiCall<void>('/api/auth/logout', { method: 'POST' }).catch(() => {});
}

export async function me(): Promise<User> {
  return apiCall<User>('/api/auth/me');
}
