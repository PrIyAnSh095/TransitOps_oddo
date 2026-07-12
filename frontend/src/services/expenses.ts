import { apiCall } from './api.ts';
import type { FuelLog, Expense } from '../types';

export async function getFuelLogs(): Promise<FuelLog[]> {
  return apiCall<FuelLog[]>('/api/fuel-logs');
}

export async function createFuelLog(data: Omit<FuelLog, 'id'>): Promise<FuelLog> {
  return apiCall<FuelLog>('/api/fuel-logs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getExpenses(): Promise<Expense[]> {
  return apiCall<Expense[]>('/api/expenses');
}

export async function createExpense(data: Omit<Expense, 'id'>): Promise<Expense> {
  return apiCall<Expense>('/api/expenses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
