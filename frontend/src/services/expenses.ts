import { apiCall } from './api.ts';
import type { FuelLog, Expense } from '../types';

// Normalize backend FuelLog document → frontend FuelLog type
function normalizeFuelLog(raw: any): FuelLog {
  return {
    id: raw._id ?? raw.id,
    vehicleId: raw.vehicle?._id ?? raw.vehicle ?? raw.vehicleId ?? '',
    tripId: raw.trip?._id ?? raw.trip ?? raw.tripId ?? undefined,
    liters: raw.litres ?? raw.liters ?? 0,
    cost: raw.cost ?? 0,
    date: raw.fuelDate ?? raw.date ?? new Date().toISOString(),
  };
}

// Normalize backend Expense document → frontend Expense type
const EXPENSE_TYPE_REVERSE: Record<string, string> = {
  TOLL: 'Toll',
  OTHER: 'Misc',
  MAINTENANCE: 'Maintenance',
  PARKING: 'Parking',
  INSURANCE: 'Insurance',
  FINE: 'Fine',
  FUEL: 'Fuel',
};

function normalizeExpense(raw: any): Expense {
  const backendType = raw.expenseType ?? raw.type ?? 'OTHER';
  return {
    id: raw._id ?? raw.id,
    vehicleId: raw.vehicle?._id ?? raw.vehicle ?? raw.vehicleId ?? undefined,
    tripId: raw.trip?._id ?? raw.trip ?? raw.tripId ?? undefined,
    type: (EXPENSE_TYPE_REVERSE[backendType] ?? backendType) as any,
    amount: raw.amount ?? 0,
    date: raw.expenseDate ?? raw.date ?? new Date().toISOString(),
  };
}


export async function getFuelLogs(): Promise<FuelLog[]> {
  const raw = await apiCall<any[]>('/api/fuel-logs');
  return raw.map(normalizeFuelLog);
}

export async function createFuelLog(data: Record<string, any>): Promise<FuelLog> {
  // Map frontend field names → backend model field names
  const payload = {
    vehicle: data.vehicleId ?? data.vehicle,
    trip: data.tripId ?? data.trip ?? null,
    litres: data.liters ?? data.litres,
    cost: data.cost,
    fuelDate: data.date ?? data.fuelDate,
    pricePerLitre: data.pricePerLitre,
    odometer: data.odometer,
    station: data.station,
    paymentMethod: data.paymentMethod,
    remarks: data.remarks,
  };
  const raw = await apiCall<any>('/api/fuel-logs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeFuelLog(raw);
}

export async function getExpenses(): Promise<Expense[]> {
  const raw = await apiCall<any[]>('/api/expenses');
  return raw.map(normalizeExpense);
}

// Map user-friendly frontend labels → backend enum values
const EXPENSE_TYPE_MAP: Record<string, string> = {
  Toll: 'TOLL',
  Misc: 'OTHER',
  Maintenance: 'MAINTENANCE',
  Parking: 'PARKING',
  Insurance: 'INSURANCE',
  Fine: 'FINE',
};

export async function createExpense(data: Record<string, any>): Promise<Expense> {
  // Map frontend field names → backend model field names
  const payload: Record<string, any> = {
    trip: data.tripId ?? data.trip ?? null,
    expenseType: EXPENSE_TYPE_MAP[data.type] ?? data.type ?? data.expenseType ?? 'OTHER',
    amount: data.amount,
    description: data.description,
    paymentMethod: data.paymentMethod,
    expenseDate: data.date ?? data.expenseDate,
  };
  // vehicle is optional — only send if a real ID was selected
  const vehicleId = data.vehicleId ?? data.vehicle;
  if (vehicleId) payload.vehicle = vehicleId;

  const raw = await apiCall<any>('/api/expenses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeExpense(raw);
}

