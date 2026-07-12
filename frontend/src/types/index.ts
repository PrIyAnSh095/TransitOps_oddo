// ---- Enums ----
export type UserRole = "FleetManager" | "Dispatcher" | "SafetyOfficer" | "FinancialAnalyst";
export type VehicleStatus = "Available" | "On Trip" | "In Shop" | "Retired";
export type DriverStatus = "Available" | "On Trip" | "Off Duty" | "Suspended";
export type TripStatus = "Draft" | "Dispatched" | "Completed" | "Cancelled";
export type MaintenanceStatus = "Active" | "Completed";
export type ExpenseType = "Toll" | "Misc" | "Maintenance";

// ---- Core Entities ----
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string; // ISO
}

export interface Vehicle {
  id: string;
  registrationNumber: string; // UNIQUE — enforced client + server
  name: string;               // e.g. "Van-05"
  type: string;                // "Van" | "Truck" | "Mini" | custom
  maxLoadCapacityKg: number;
  documents?: { name: string, url: string }[];
  odometerKm: number;
  acquisitionCost: number;
  status: VehicleStatus;
  region?: string;             // used by dashboard filter
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;     // e.g. "LMV", "HMV"
  licenseExpiryDate: string;   // ISO date
  contactNumber: string;
  safetyScore: number;         // 0-100
  status: DriverStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  tripCode: string;            // e.g. "TR001"
  source: string;
  destination: string;
  vehicleId: string | null;
  driverId: string | null;
  cargoWeightKg: number;
  plannedDistanceKm: number;
  actualDistanceKm?: number;   // filled on completion
  fuelConsumedLiters?: number; // filled on completion
  status: TripStatus;
  dispatchedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  serviceType: string;         // "Oil Change", "Engine Repair"...
  cost: number;
  date: string;
  status: MaintenanceStatus;
  notes?: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  tripId?: string;
  liters: number;
  cost: number;
  date: string;
}

export interface Expense {
  id: string;
  tripId?: string;
  vehicleId?: string;
  type: ExpenseType;
  amount: number;
  date: string;
}
