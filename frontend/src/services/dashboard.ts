import { apiCall } from './api.ts';

export interface KPIResponse {
  activeVehicles: number;
  totalVehicles: number;
  activeTrips: number;
  totalDrivers: number;
  alerts: number;
  trendData: Array<{ name: string; cost: number }>;
}

export interface DispatcherResponse {
  activeTrips: Array<{ id: string; code: string; status: string; vehicle: string; driver: string; destination: string }>;
  availableDrivers: Array<{ id: string; name: string; status: string }>;
}

export async function getDashboardKPIs(): Promise<KPIResponse> {
  return apiCall<KPIResponse>('/api/dashboard/kpis');
}

export async function getDispatcherDashboard(): Promise<DispatcherResponse> {
  return apiCall<DispatcherResponse>('/api/dashboard/dispatcher');
}
