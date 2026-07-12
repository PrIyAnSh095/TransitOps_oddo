import { apiCall } from './api.ts';
import type { Trip } from '../types';

export async function getTrips(filters?: Record<string, string>): Promise<Trip[]> {
  const query = filters ? '?' + new URLSearchParams(filters).toString() : '';
  return apiCall<Trip[]>(`/api/trips${query}`);
}

export async function createTrip(data: {
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeightKg: number;
  plannedDistanceKm: number;
}): Promise<Trip> {
  return apiCall<Trip>('/api/trips', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function dispatchTrip(id: string): Promise<Trip> {
  return apiCall<Trip>(`/api/trips/${id}/dispatch`, {
    method: 'PUT',
  });
}

export async function completeTrip(id: string, data: {
  actualDistanceKm: number;
  fuelConsumedLiters: number;
}): Promise<Trip> {
  return apiCall<Trip>(`/api/trips/${id}/complete`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function cancelTrip(id: string): Promise<Trip> {
  return apiCall<Trip>(`/api/trips/${id}/cancel`, {
    method: 'PUT',
  });
}

import type { SummaryData } from './vehicles.ts';

export async function getTripsSummary(filters?: Record<string, string>): Promise<SummaryData> {
  const query = filters ? '?' + new URLSearchParams(filters).toString() : '';
  return apiCall<SummaryData>(`/api/trips/summary${query}`);
}
