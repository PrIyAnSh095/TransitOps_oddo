import type {
  Vehicle,
  Driver,
  Trip,
  MaintenanceLog,
  FuelLog,
  Expense,
} from "../types";

export const mockVehicles: Vehicle[] = [
  { id: "v1", registrationNumber: "AB123CD", name: "Van-01", type: "Van", maxLoadCapacityKg: 500, odometerKm: 12000, acquisitionCost: 25000, status: "Available", region: "North", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "v2", registrationNumber: "EF456GH", name: "Truck-01", type: "Truck", maxLoadCapacityKg: 5000, odometerKm: 45000, acquisitionCost: 65000, status: "On Trip", region: "South", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "v3", registrationNumber: "IJ789KL", name: "Mini-01", type: "Mini", maxLoadCapacityKg: 200, odometerKm: 8000, acquisitionCost: 15000, status: "In Shop", region: "East", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "v4", registrationNumber: "MN012OP", name: "Van-02", type: "Van", maxLoadCapacityKg: 500, odometerKm: 55000, acquisitionCost: 24000, status: "Retired", region: "West", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "v5", registrationNumber: "QR345ST", name: "Truck-02", type: "Truck", maxLoadCapacityKg: 6000, odometerKm: 15000, acquisitionCost: 70000, status: "Available", region: "North", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const mockDrivers: Driver[] = [
  { id: "d1", name: "Alice Smith", licenseNumber: "L-001", licenseCategory: "LMV", licenseExpiryDate: "2027-12-31T00:00:00.000Z", contactNumber: "555-0101", safetyScore: 95, status: "Available", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "d2", name: "Bob Jones", licenseNumber: "L-002", licenseCategory: "HMV", licenseExpiryDate: "2028-06-30T00:00:00.000Z", contactNumber: "555-0102", safetyScore: 88, status: "On Trip", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "d3", name: "Charlie Brown", licenseNumber: "L-003", licenseCategory: "LMV", licenseExpiryDate: "2024-01-01T00:00:00.000Z", contactNumber: "555-0103", safetyScore: 70, status: "Available", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "d4", name: "Diana Prince", licenseNumber: "L-004", licenseCategory: "HMV", licenseExpiryDate: "2026-10-15T00:00:00.000Z", contactNumber: "555-0104", safetyScore: 99, status: "Suspended", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "d5", name: "Evan Davis", licenseNumber: "L-005", licenseCategory: "LMV", licenseExpiryDate: "2029-03-20T00:00:00.000Z", contactNumber: "555-0105", safetyScore: 92, status: "Off Duty", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const mockTrips: Trip[] = [
  { id: "t1", tripCode: "TR001", source: "Warehouse A", destination: "Store 1", vehicleId: "v1", driverId: "d1", cargoWeightKg: 400, plannedDistanceKm: 25, status: "Draft", createdAt: new Date().toISOString() },
  { id: "t2", tripCode: "TR002", source: "Warehouse B", destination: "Store 2", vehicleId: "v2", driverId: "d2", cargoWeightKg: 4500, plannedDistanceKm: 150, status: "Dispatched", dispatchedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: "t3", tripCode: "TR003", source: "Warehouse C", destination: "Store 3", vehicleId: "v5", driverId: "d5", cargoWeightKg: 300, plannedDistanceKm: 45, status: "Completed", actualDistanceKm: 48, fuelConsumedLiters: 5, dispatchedAt: "2026-07-10T10:00:00.000Z", completedAt: "2026-07-10T14:00:00.000Z", createdAt: "2026-07-10T09:00:00.000Z" },
  { id: "t4", tripCode: "TR004", source: "Warehouse A", destination: "Store 4", vehicleId: "v4", driverId: "d4", cargoWeightKg: 450, plannedDistanceKm: 30, status: "Cancelled", cancelledAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: "t5", tripCode: "TR005", source: "Warehouse B", destination: "Store 5", vehicleId: null, driverId: null, cargoWeightKg: 100, plannedDistanceKm: 10, status: "Draft", createdAt: new Date().toISOString() },
  { id: "t6", tripCode: "TR006", source: "Warehouse C", destination: "Store 6", vehicleId: "v1", driverId: "d1", cargoWeightKg: 200, plannedDistanceKm: 20, status: "Completed", actualDistanceKm: 22, fuelConsumedLiters: 2, dispatchedAt: "2026-07-11T08:00:00.000Z", completedAt: "2026-07-11T10:00:00.000Z", createdAt: "2026-07-11T07:00:00.000Z" },
];

export const mockMaintenanceLogs: MaintenanceLog[] = [
  { id: "m1", vehicleId: "v3", serviceType: "Engine Repair", cost: 1500, date: new Date().toISOString(), status: "Active", notes: "Engine knocking sound" },
  { id: "m2", vehicleId: "v1", serviceType: "Oil Change", cost: 100, date: "2026-06-01T00:00:00.000Z", status: "Completed", notes: "Routine maintenance" },
  { id: "m3", vehicleId: "v4", serviceType: "Transmission Replacement", cost: 3000, date: "2025-12-01T00:00:00.000Z", status: "Completed" },
];

export const mockFuelLogs: FuelLog[] = [
  { id: "f1", vehicleId: "v5", tripId: "t3", liters: 5, cost: 25, date: "2026-07-10T12:00:00.000Z" },
  { id: "f2", vehicleId: "v1", tripId: "t6", liters: 2, cost: 10, date: "2026-07-11T09:00:00.000Z" },
];

export const mockExpenses: Expense[] = [
  { id: "e1", tripId: "t3", type: "Toll", amount: 15, date: "2026-07-10T11:00:00.000Z" },
  { id: "e2", vehicleId: "v3", type: "Misc", amount: 50, date: new Date().toISOString() },
  { id: "e3", vehicleId: "v1", type: "Maintenance", amount: 100, date: "2026-06-01T00:00:00.000Z" },
];
