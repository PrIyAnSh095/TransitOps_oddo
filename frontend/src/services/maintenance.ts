import { apiCall } from './api.ts';
import type { MaintenanceLog } from '../types';

export async function getMaintenanceLogs(): Promise<MaintenanceLog[]> {
  return apiCall<MaintenanceLog[]>('/api/maintenance');
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
