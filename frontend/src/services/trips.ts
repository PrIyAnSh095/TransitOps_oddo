import { apiCall } from './api.ts';
import type { Trip } from '../types';

// Normalize backend Trip document → frontend Trip type
function normalizeTrip(raw: any): Trip {
  return {
    id: raw._id ?? raw.id,
    tripCode: raw.tripCode ?? raw.tripNumber ?? '',
    source: raw.source ?? '',
    destination: raw.destination ?? '',
    vehicleId: raw.vehicle?._id ?? raw.vehicle ?? raw.vehicleId ?? null,
    driverId: raw.driver?._id ?? raw.driver ?? raw.driverId ?? null,
    cargoWeightKg: raw.cargoWeight ?? raw.cargoWeightKg ?? 0,
    plannedDistanceKm: raw.plannedDistance ?? raw.plannedDistanceKm ?? 0,
    actualDistanceKm: raw.actualDistance ?? raw.actualDistanceKm,
    fuelConsumedLiters: raw.fuelUsed ?? raw.fuelConsumedLiters,
    status: raw.status,
    dispatchedAt: raw.dispatchTime ?? raw.dispatchedAt,
    completedAt: raw.completionTime ?? raw.completedAt,
    cancelledAt: raw.cancelledAt,
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}

export async function getTrips(filters?: Record<string, string>): Promise<Trip[]> {
  const query = filters ? '?' + new URLSearchParams(filters).toString() : '';
  const raw = await apiCall<any[]>(`/api/trips${query}`);
  return raw.map(normalizeTrip);
}

export async function createTrip(data: {
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeightKg: number;
  plannedDistanceKm: number;
}): Promise<Trip> {
  const raw = await apiCall<any>('/api/trips', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return normalizeTrip(raw);
}

export async function dispatchTrip(id: string): Promise<Trip> {
  const raw = await apiCall<any>(`/api/trips/${id}/dispatch`, { method: 'PUT' });
  return normalizeTrip(raw);
}

export async function completeTrip(id: string, data: {
  actualDistanceKm: number;
  fuelConsumedLiters: number;
}): Promise<Trip> {
  const raw = await apiCall<any>(`/api/trips/${id}/complete`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return normalizeTrip(raw);
}

export async function cancelTrip(id: string): Promise<Trip> {
  const raw = await apiCall<any>(`/api/trips/${id}/cancel`, { method: 'PUT' });
  return normalizeTrip(raw);
}

import type { SummaryData } from './vehicles.ts';

export async function getTripsSummary(filters?: Record<string, string>): Promise<SummaryData> {
  const query = filters ? '?' + new URLSearchParams(filters).toString() : '';
  return apiCall<SummaryData>(`/api/trips/summary${query}`);
}
