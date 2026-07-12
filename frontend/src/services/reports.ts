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
  
  // New Chart Datasets
  revenueVsCost: { month: string; revenue: number; cost: number }[];
  fleetUtilizationTrend: { date: string; utilization: number }[];
  fuelCostByVehicleType: { type: string; cost: number }[];
  topFuelConsumingVehicles: { name: string; fuel: number }[];
  maintenanceCostTrend: { month: string; cost: number }[];
  topMaintenanceCostVehicles: { name: string; cost: number }[];
  vehicleTypeDistribution: { type: string; count: number }[];
  expenseDistribution: { expenseType: string; amount: number }[];
  driverPerformanceRanking: { name: string; score: number }[];
  tripCompletionTrend: { month: string; trips: number }[];
  revenueByVehicleType: { type: string; revenue: number }[];
  vehicleROIChart: { name: string; roi: number }[];
  monthlyFuelEfficiency: { month: string; efficiency: number }[];
  averageTripDistance: { month: string; distance: number }[];
  vehicleDowntime: { name: string; days: number }[];
  tripStatusDistribution: { status: string; count: number }[];
}

export async function getAnalytics(): Promise<AnalyticsPayload> {
  return apiCall<AnalyticsPayload>('/api/reports/analytics');
}
