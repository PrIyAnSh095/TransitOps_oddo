import { apiCall } from './api.ts';
import type { Driver } from '../types';

export async function getDrivers(filters?: Record<string, string>): Promise<Driver[]> {
  const query = filters ? '?' + new URLSearchParams(filters).toString() : '';
  return apiCall<Driver[]>(`/api/drivers${query}`);
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
import type { SummaryData } from './vehicles.ts';

export async function getDriversSummary(filters?: Record<string, string>): Promise<SummaryData> {
  const query = filters ? '?' + new URLSearchParams(filters).toString() : '';
  return apiCall<SummaryData>(`/api/drivers/summary${query}`);
}
