import type { User, Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense } from '../types';
import { mockVehicles, mockDrivers, mockTrips, mockMaintenanceLogs, mockFuelLogs, mockExpenses } from './data.ts';

// Mock users for different roles
const mockUsers: Record<string, User> = {
  'fleet@test.com': { id: 'u1', name: 'Fleet Manager', email: 'fleet@test.com', role: 'FleetManager', createdAt: new Date().toISOString() },
  'dispatcher@test.com': { id: 'u2', name: 'Dispatcher', email: 'dispatcher@test.com', role: 'Dispatcher', createdAt: new Date().toISOString() },
  'safety@test.com': { id: 'u3', name: 'Safety Officer', email: 'safety@test.com', role: 'SafetyOfficer', createdAt: new Date().toISOString() },
  'finance@test.com': { id: 'u4', name: 'Financial Analyst', email: 'finance@test.com', role: 'FinancialAnalyst', createdAt: new Date().toISOString() },
};

let vehicles = [...mockVehicles];
let drivers = [...mockDrivers];
let trips = [...mockTrips];
let maintenanceLogs = [...mockMaintenanceLogs];
let fuelLogs = [...mockFuelLogs];
let expenses = [...mockExpenses];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const handlers: Record<string, (body?: any, path?: string) => Promise<any>> = {
  'POST /auth/login': async (body: any) => {
    await delay(800);
    const user = mockUsers[body.email];
    if (user && body.password === 'password') {
      return { token: `mock-token-${user.id}`, user };
    }
    throw new Error('Invalid credentials. Use role@test.com and password');
  },
  'GET /auth/me': async () => {
    await delay(300);
    // Just return the first user for now in mock, ideally we check the token
    const token = localStorage.getItem('transitops_token');
    if (!token) throw new Error('Not authenticated');
    
    const userId = token.split('-')[2];
    const user = Object.values(mockUsers).find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    
    return user;
  },
  'GET /dashboard/kpis': async () => {
    await delay(800); // Trigger buffer
    return {
      activeVehicles: 4,
      totalVehicles: 5,
      activeTrips: 2,
      totalDrivers: 5,
      alerts: 1, // vehicle in shop
      trendData: [
        { name: 'Mon', cost: 400 },
        { name: 'Tue', cost: 300 },
        { name: 'Wed', cost: 550 },
        { name: 'Thu', cost: 450 },
        { name: 'Fri', cost: 700 },
        { name: 'Sat', cost: 200 },
        { name: 'Sun', cost: 100 },
      ]
    };
  },
  'GET /dashboard/dispatcher': async () => {
    await delay(800); // Trigger buffer
    return {
      activeTrips: [
        { id: 't2', code: 'TR002', status: 'Dispatched', vehicle: 'Van-01', driver: 'Alice Smith', destination: 'Store 2' }
      ],
      availableDrivers: [
        { id: 'd1', name: 'Alice Smith', status: 'Available' },
        { id: 'd3', name: 'Charlie Brown', status: 'Available' }
      ]
    };
  },
  'GET /vehicles': async () => {
    await delay(500);
    return vehicles;
  },
  'POST /vehicles': async (body: any) => {
    await delay(500);
    const newVehicle: Vehicle = {
      ...body,
      id: `v${Date.now()}`,
      status: 'Available', // initial status
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    vehicles.push(newVehicle);
    return newVehicle;
  },
  'PUT /vehicles/:id': async (body: any, path?: string) => {
    await delay(500);
    const id = path?.split('/').pop();
    const index = vehicles.findIndex(v => v.id === id);
    if (index === -1) throw new Error('Vehicle not found');
    
    vehicles[index] = {
      ...vehicles[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    return vehicles[index];
  },
  'GET /drivers': async () => {
    await delay(500);
    return drivers;
  },
  'POST /drivers': async (body: any) => {
    await delay(500);
    const newDriver: Driver = {
      ...body,
      id: `d${Date.now()}`,
      status: 'Available', // initial status
      safetyScore: body.safetyScore || 100, // default
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    drivers.push(newDriver);
    return newDriver;
  },
  'PUT /drivers/:id': async (body: any, path?: string) => {
    await delay(500);
    const id = path?.split('/').pop();
    const index = drivers.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Driver not found');
    
    drivers[index] = {
      ...drivers[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    return drivers[index];
  },
  'GET /trips': async () => {
    await delay(500);
    return trips;
  },
  'POST /trips': async (body: any) => {
    await delay(500);
    const newTrip: Trip = {
      ...body,
      id: `t${Date.now()}`,
      tripCode: `TR${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Draft',
      createdAt: new Date().toISOString(),
    };
    trips.unshift(newTrip);
    return newTrip;
  },
  'PUT /trips/:id/dispatch': async (_body: any, path?: string) => {
    await delay(500);
    const id = path?.split('/')[2];
    const index = trips.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Trip not found');

    const trip = trips[index];
    if (trip.status !== 'Draft') throw new Error('Only Draft trips can be dispatched');

    // Mutate Trip
    trip.status = 'Dispatched';
    trip.dispatchedAt = new Date().toISOString();

    // Mutate Vehicle & Driver
    if (trip.vehicleId) {
      const v = vehicles.find(v => v.id === trip.vehicleId);
      if (v) v.status = 'On Trip';
    }
    if (trip.driverId) {
      const d = drivers.find(d => d.id === trip.driverId);
      if (d) d.status = 'On Trip';
    }

    return trip;
  },
  'PUT /trips/:id/complete': async (body: any, path?: string) => {
    await delay(500);
    const id = path?.split('/')[2];
    const index = trips.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Trip not found');

    const trip = trips[index];
    if (trip.status !== 'Dispatched') throw new Error('Only Dispatched trips can be completed');

    trip.status = 'Completed';
    trip.completedAt = new Date().toISOString();
    trip.actualDistanceKm = body.actualDistanceKm;
    trip.fuelConsumedLiters = body.fuelConsumedLiters;

    if (trip.vehicleId) {
      const v = vehicles.find(v => v.id === trip.vehicleId);
      if (v) {
        v.status = 'Available';
        if (trip.actualDistanceKm) v.odometerKm += trip.actualDistanceKm;
      }
    }
    if (trip.driverId) {
      const d = drivers.find(d => d.id === trip.driverId);
      if (d) d.status = 'Available';
    }

    return trip;
  },
  'PUT /trips/:id/cancel': async (_body: any, path?: string) => {
    await delay(500);
    const id = path?.split('/')[2];
    const index = trips.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Trip not found');

    const trip = trips[index];
    if (trip.status !== 'Dispatched') throw new Error('Only Dispatched trips can be cancelled');

    trip.status = 'Cancelled';
    trip.cancelledAt = new Date().toISOString();

    if (trip.vehicleId) {
      const v = vehicles.find(v => v.id === trip.vehicleId);
      if (v) v.status = 'Available';
    }
    if (trip.driverId) {
      const d = drivers.find(d => d.id === trip.driverId);
      if (d) d.status = 'Available';
    }

    return trip;
  },
  'GET /maintenance': async () => {
    await delay(500);
    return maintenanceLogs;
  },
  'POST /maintenance': async (body: any) => {
    await delay(500);
    const newLog: MaintenanceLog = {
      ...body,
      id: `m${Date.now()}`,
      status: 'Active',
    };
    maintenanceLogs.unshift(newLog);

    // Flip vehicle to In Shop
    const v = vehicles.find(v => v.id === newLog.vehicleId);
    if (v && v.status !== 'Retired') {
      v.status = 'In Shop';
    }

    return newLog;
  },
  'PUT /maintenance/:id/close': async (_body: any, path?: string) => {
    await delay(500);
    const id = path?.split('/')[2];
    const index = maintenanceLogs.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Maintenance log not found');

    const log = maintenanceLogs[index];
    if (log.status !== 'Active') throw new Error('Only Active logs can be closed');

    log.status = 'Completed';

    // Flip vehicle to Available (unless retired)
    const v = vehicles.find(v => v.id === log.vehicleId);
    if (v && v.status !== 'Retired') {
      v.status = 'Available';
    }

    return log;
  },
  'GET /fuel-logs': async () => {
    await delay(500);
    return fuelLogs;
  },
  'POST /fuel-logs': async (body: any) => {
    await delay(500);
    const newLog: FuelLog = {
      ...body,
      id: `f${Date.now()}`,
    };
    fuelLogs.unshift(newLog);
    return newLog;
  },
  'GET /expenses': async () => {
    await delay(500);
    return expenses;
  },
  'POST /expenses': async (body: any) => {
    await delay(500);
    const newExpense: Expense = {
      ...body,
      id: `e${Date.now()}`,
    };
    expenses.unshift(newExpense);
    return newExpense;
  },
  'GET /reports/analytics': async () => {
    await delay(500);

    // 1. Fuel Efficiency = Total Distance / Total Fuel Consumed
    const completedTrips = trips.filter(t => t.status === 'Completed' && t.actualDistanceKm && t.fuelConsumedLiters);
    const totalDist = completedTrips.reduce((sum, t) => sum + (t.actualDistanceKm || 0), 0);
    const totalFuel = completedTrips.reduce((sum, t) => sum + (t.fuelConsumedLiters || 0), 0);
    const fuelEfficiency = totalFuel > 0 ? (totalDist / totalFuel) : 0;

    // 2. Fleet Utilization = (Available + On Trip) / Total Vehicles %
    const activeVehicles = vehicles.filter(v => v.status === 'Available' || v.status === 'On Trip').length;
    const fleetUtilization = vehicles.length > 0 ? (activeVehicles / vehicles.length) * 100 : 0;

    // 3. Operational Cost = All expenses + all fuel logs + all maintenance logs
    const totalExpensesCost = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
    const totalMaintCost = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
    const operationalCost = totalExpensesCost + totalFuelCost + totalMaintCost;

    // 4. Vehicle ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
    // Assumption: Revenue = actualDistanceKm * $5.00
    let totalRevenue = 0;
    let totalAcquisition = 0;
    
    // Revenue per vehicle map
    const revMap: Record<string, number> = {};
    completedTrips.forEach(t => {
      if (t.vehicleId) {
        const rev = (t.actualDistanceKm || 0) * 5;
        revMap[t.vehicleId] = (revMap[t.vehicleId] || 0) + rev;
        totalRevenue += rev;
      }
    });

    vehicles.forEach(v => {
      totalAcquisition += v.acquisitionCost || 0;
    });

    const vehicleROI = totalAcquisition > 0 ? ((totalRevenue - (totalMaintCost + totalFuelCost)) / totalAcquisition) * 100 : 0;

    // Top Costliest Vehicles
    const costMap: Record<string, number> = {};
    fuelLogs.forEach(f => {
      if (f.vehicleId) costMap[f.vehicleId] = (costMap[f.vehicleId] || 0) + f.cost;
    });
    maintenanceLogs.forEach(m => {
      costMap[m.vehicleId] = (costMap[m.vehicleId] || 0) + m.cost;
    });
    expenses.forEach(e => {
      if (e.vehicleId) costMap[e.vehicleId] = (costMap[e.vehicleId] || 0) + e.amount;
    });

    const topCostliestVehicles = Object.entries(costMap)
      .map(([id, cost]) => {
        const v = vehicles.find(v => v.id === id);
        return {
          id,
          name: v ? `${v.registrationNumber} (${v.name})` : 'Unknown',
          cost,
          revenue: revMap[id] || 0,
          acquisitionCost: v?.acquisitionCost || 0
        };
      })
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);

    // Mock Monthly Revenue
    const cleanMonthlyRevenue = [
      { month: 'Jan', revenue: 45000 },
      { month: 'Feb', revenue: 52000 },
      { month: 'Mar', revenue: 48000 },
      { month: 'Apr', revenue: 61000 },
      { month: 'May', revenue: 59000 },
      { month: 'Jun', revenue: totalRevenue > 65000 ? totalRevenue : 65000 },
    ];

    return {
      fuelEfficiency,
      fleetUtilization,
      operationalCost,
      vehicleROI,
      monthlyRevenue: cleanMonthlyRevenue,
      topCostliestVehicles,
      totalRevenue,
      totalAcquisition
    };
  }
};

export default handlers;
