import { apiCall } from './api.ts';

export interface AnalyticsPayload {
  fuelEfficiency: number;
  fleetUtilization: number;
  operationalCost: number;
  vehicleROI: number;
  monthlyRevenue: { month: string; revenue: number }[];
  topCostliestVehicles: {
    id: string;
    name: string;
    cost: number;
    revenue: number;
    acquisitionCost: number;
  }[];
  totalRevenue: number;
  totalAcquisition: number;
}

export async function getAnalytics(): Promise<AnalyticsPayload> {
  return apiCall<AnalyticsPayload>('/api/reports/analytics');
}
