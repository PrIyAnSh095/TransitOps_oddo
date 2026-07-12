import { apiCall } from './api.ts';
import type { Vehicle } from '../types';

export async function getVehicles(filters?: Record<string, string>): Promise<Vehicle[]> {
  const query = filters ? '?' + new URLSearchParams(filters).toString() : '';
  return apiCall<Vehicle[]>(`/api/vehicles${query}`);
}

export async function createVehicle(data: Omit<Vehicle, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
  return apiCall<Vehicle>('/api/vehicles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
  return apiCall<Vehicle>(`/api/vehicles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
export interface SummaryData {
  chartData: Array<{ name: string; value: number }>;
  stats: Array<{ label: string; value: string | number; color?: string }>;
}

export async function getFleetSummary(filters?: Record<string, string>): Promise<SummaryData> {
  const query = filters ? '?' + new URLSearchParams(filters).toString() : '';
  return apiCall<SummaryData>(`/api/vehicles/summary${query}`);
}
