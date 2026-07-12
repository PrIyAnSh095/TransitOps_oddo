import { apiCall } from './api.ts';
import type { MaintenanceLog } from '../types';
import type { SummaryData } from './vehicles.ts';

export function normalizeMaintenanceLog(data: any): MaintenanceLog {
  return {
    id: data._id,
    vehicleId: data.vehicle?._id || data.vehicle,
    serviceType: data.maintenanceType || 'General Service',
    cost: data.actualCost ?? data.estimatedCost ?? 0,
    date: data.createdAt || data.startDate || new Date().toISOString(),
    status: data.status || 'ACTIVE',
    notes: data.description || data.notes || '',
  };
}

export async function getMaintenanceLogs(filters?: Record<string, string>): Promise<MaintenanceLog[]> {
  const query = filters ? '?' + new URLSearchParams(filters).toString() : '';
  const data = await apiCall<any[]>(`/api/maintenance${query}`);
  return data.map(normalizeMaintenanceLog);
}

export async function createMaintenanceLog(data: Omit<MaintenanceLog, 'id' | 'status'>): Promise<MaintenanceLog> {
  const payload = {
    vehicle: data.vehicleId,
    maintenanceType: data.serviceType,
    estimatedCost: data.cost,
    description: data.notes
  };
  const res = await apiCall<any>('/api/maintenance', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeMaintenanceLog(res);
}

export async function closeMaintenanceLog(id: string): Promise<MaintenanceLog> {
  const res = await apiCall<any>(`/api/maintenance/${id}/close`, {
    method: 'PUT',
  });
  return normalizeMaintenanceLog(res);
}

export async function getMaintenanceSummary(filters?: Record<string, string>): Promise<SummaryData> {
  const query = filters ? '?' + new URLSearchParams(filters).toString() : '';
  return apiCall<SummaryData>(`/api/maintenance/summary${query}`);
}
