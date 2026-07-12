import { apiCall } from './api.ts';
import type { Driver } from '../types';

export async function getDrivers(): Promise<Driver[]> {
  return apiCall<Driver[]>('/api/drivers');
}

export async function createDriver(data: Omit<Driver, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'safetyScore'>): Promise<Driver> {
  return apiCall<Driver>('/api/drivers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateDriver(id: string, data: Partial<Driver>): Promise<Driver> {
  return apiCall<Driver>(`/api/drivers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
