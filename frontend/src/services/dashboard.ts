import { apiCall } from './api.ts';

export interface ManagerKPIs {
  totalVehicles: number;
  availableVehicles: number;
  activeTrips: number;
  driversOnDuty: number;
  vehiclesInMaintenance: number;
  fleetUtilization: number;
  monthlyRevenue: number;
  monthlyOperationalCost: number;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export interface LineChartData {
  name: string;
  value: number;
}

export interface ActivityFeedItem {
  id: string;
  type: 'Trip Created' | 'Trip Completed' | 'Maintenance Started' | 'Maintenance Completed' | 'Fuel Added' | 'Expense Added';
  description: string;
  timestamp: string;
}

export interface AlertItem {
  id: string;
  type: 'License Expiry' | 'Vehicle Documents Expiry' | 'Maintenance Due' | 'Vehicle Idle' | 'Delayed Trips';
  message: string;
  severity: 'high' | 'medium' | 'low';
}

export interface DispatcherVehicle {
  id: string;
  registrationNumber: string;
  capacity: number;
  region: string;
  status: string;
}

export interface DispatcherDriver {
  id: string;
  name: string;
  status: string;
}

export interface DispatchSuggestion {
  id: string;
  tripCode: string;
  recommendedVehicleId: string;
  recommendedDriverId: string;
  reason: string;
}

export async function getManagerKPIs(): Promise<ManagerKPIs> {
  return apiCall<ManagerKPIs>('/api/dashboard/kpis');
}
export async function getFleetStatus(): Promise<PieChartData[]> {
  return apiCall<PieChartData[]>('/api/dashboard/fleet-status');
}
export async function getDriverStatus(): Promise<PieChartData[]> {
  return apiCall<PieChartData[]>('/api/dashboard/driver-status');
}
export async function getTripsTrend(): Promise<LineChartData[]> {
  return apiCall<LineChartData[]>('/api/dashboard/trips-trend');
}
export async function getFuelTrend(): Promise<LineChartData[]> {
  return apiCall<LineChartData[]>('/api/dashboard/fuel-trend');
}
export async function getCostBreakdown(): Promise<PieChartData[]> {
  return apiCall<PieChartData[]>('/api/dashboard/cost-breakdown');
}
export async function getRecentActivity(): Promise<ActivityFeedItem[]> {
  return apiCall<ActivityFeedItem[]>('/api/dashboard/recent-activity');
}
export async function getAlerts(): Promise<AlertItem[]> {
  return apiCall<AlertItem[]>('/api/dashboard/alerts');
}

// Dispatcher Dashboard
export async function getAvailableVehicles(): Promise<DispatcherVehicle[]> {
  return apiCall<DispatcherVehicle[]>('/api/dashboard/available-vehicles');
}
export async function getAvailableDrivers(): Promise<DispatcherDriver[]> {
  return apiCall<DispatcherDriver[]>('/api/dashboard/available-drivers');
}
export async function getActiveTrips(): Promise<any[]> {
  return apiCall<any[]>('/api/dashboard/active-trips');
}
export async function getDispatchSuggestions(): Promise<DispatchSuggestion[]> {
  return apiCall<DispatchSuggestion[]>('/api/dashboard/dispatch-suggestions');
}
export async function getRecentDispatchActivity(): Promise<ActivityFeedItem[]> {
  return apiCall<ActivityFeedItem[]>('/api/dashboard/recent-dispatch-activity');
}
