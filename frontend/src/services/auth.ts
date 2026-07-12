import { apiCall } from './api';
import type { User } from '../types';

interface LoginResponse {
  token: string;
  user: User;
}

export async function login(email: string, password: string, turnstileToken?: string): Promise<LoginResponse> {
  return apiCall<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, turnstileToken }),
  });
}

export async function logout(): Promise<void> {
  return apiCall<void>('/api/auth/logout', { method: 'POST' }).catch(() => {});
}

export async function me(): Promise<User> {
  return apiCall<User>('/api/auth/me');
}

export async function updateProfile(data: { name: string }): Promise<User> {
  return apiCall<User>('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function requestPasswordChange(currentPassword: string): Promise<{ message: string }> {
  return apiCall<{ message: string }>('/api/auth/request-password-change', {
    method: 'POST',
    body: JSON.stringify({ currentPassword }),
  });
}
