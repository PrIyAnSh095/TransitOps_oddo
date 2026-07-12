import { apiCall } from './api.ts';
import type { MaintenanceLog } from '../types';

export async function getMaintenanceLogs(filters?: Record<string, string>): Promise<MaintenanceLog[]> {
  const query = filters ? '?' + new URLSearchParams(filters).toString() : '';
  return apiCall<MaintenanceLog[]>(`/api/maintenance${query}`);
}

export async function createMaintenanceLog(data: Omit<MaintenanceLog, 'id' | 'status'>): Promise<MaintenanceLog> {
  return apiCall<MaintenanceLog>('/api/maintenance', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function closeMaintenanceLog(id: string): Promise<MaintenanceLog> {
  return apiCall<MaintenanceLog>(`/api/maintenance/${id}/close`, {
    method: 'PUT',
  });
}

import type { SummaryData } from './vehicles.ts';

export async function getMaintenanceSummary(filters?: Record<string, string>): Promise<SummaryData> {
  const query = filters ? '?' + new URLSearchParams(filters).toString() : '';
  return apiCall<SummaryData>(`/api/maintenance/summary${query}`);
}
