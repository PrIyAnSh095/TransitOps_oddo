import { apiCall } from './api.ts';
import type { Vehicle } from '../types';

export async function getVehicles(): Promise<Vehicle[]> {
  return apiCall<Vehicle[]>('/api/vehicles');
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
