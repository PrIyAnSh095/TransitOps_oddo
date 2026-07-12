import { apiCall } from './api';
import type { UserRole } from '../types';

export interface NewUserPayload {
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

export interface CreatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export async function createUser(data: NewUserPayload): Promise<CreatedUser> {
  return apiCall<CreatedUser>('/api/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getUsers(): Promise<CreatedUser[]> {
  return apiCall<CreatedUser[]>('/api/users');
}
