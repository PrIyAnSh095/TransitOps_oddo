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
    await delay(300);
    return {
      totalVehicles: 24,
      availableVehicles: 15,
      activeTrips: 8,
      driversOnDuty: 12,
      vehiclesInMaintenance: 4,
      fleetUtilization: 75.5,
      monthlyRevenue: 125400,
      monthlyOperationalCost: 48200
    };
  },
  'GET /dashboard/fleet-status': async () => {
    await delay(300);
    return [
      { name: 'Available', value: 15, color: '#48ddbc' },
      { name: 'On Trip', value: 5, color: '#558ded' },
      { name: 'In Shop', value: 4, color: '#ff6b6b' },
    ];
  },
  'GET /dashboard/driver-status': async () => {
    await delay(300);
    return [
      { name: 'Available', value: 8, color: '#48ddbc' },
      { name: 'On Duty', value: 12, color: '#558ded' },
      { name: 'Off Duty', value: 5, color: '#8e9192' },
    ];
  },
  'GET /dashboard/trips-trend': async () => {
    await delay(300);
    return [
      { name: 'Mon', value: 12 }, { name: 'Tue', value: 15 }, 
      { name: 'Wed', value: 18 }, { name: 'Thu', value: 14 },
      { name: 'Fri', value: 22 }, { name: 'Sat', value: 25 }, 
      { name: 'Sun', value: 10 }
    ];
  },
  'GET /dashboard/fuel-trend': async () => {
    await delay(300);
    return [
      { name: 'Mon', value: 450 }, { name: 'Tue', value: 520 }, 
      { name: 'Wed', value: 480 }, { name: 'Thu', value: 550 },
      { name: 'Fri', value: 610 }, { name: 'Sat', value: 720 }, 
      { name: 'Sun', value: 300 }
    ];
  },
  'GET /dashboard/cost-breakdown': async () => {
    await delay(300);
    return [
      { name: 'Fuel', value: 45000, color: '#558ded' },
      { name: 'Maintenance', value: 28000, color: '#ff6b6b' },
      { name: 'Tolls', value: 8500, color: '#ffc633' },
      { name: 'Insurance', value: 12000, color: '#48ddbc' },
    ];
  },
  'GET /dashboard/recent-activity': async () => {
    await delay(300);
    return [
      { id: '1', type: 'Trip Created', description: 'Trip TR4829 created for VAN-002', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
      { id: '2', type: 'Fuel Added', description: '45L Diesel logged for TRK-001', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
      { id: '3', type: 'Maintenance Completed', description: 'Oil change completed on BUS-010', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
      { id: '4', type: 'Trip Completed', description: 'TR4810 completed by Driver Alice', timestamp: new Date(Date.now() - 1000 * 60 * 200).toISOString() },
    ];
  },
  'GET /dashboard/alerts': async () => {
    await delay(300);
    return [
      { id: '1', type: 'License Expiry', message: 'John Doe license expires in 3 days', severity: 'high' },
      { id: '2', type: 'Maintenance Due', message: 'TRK-005 due for routine service', severity: 'medium' },
      { id: '3', type: 'Delayed Trips', message: 'TR4820 is running 45m behind schedule', severity: 'medium' },
    ];
  },
  'GET /dashboard/available-vehicles': async () => {
    await delay(300);
    return [
      { id: 'v1', registrationNumber: 'TRK-001', capacity: 15000, region: 'North', status: 'Available' },
      { id: 'v2', registrationNumber: 'VAN-002', capacity: 2500, region: 'South', status: 'Available' },
    ];
  },
  'GET /dashboard/available-drivers': async () => {
    await delay(300);
    return [
      { id: 'd1', name: 'Alice Smith', status: 'Available' },
      { id: 'd3', name: 'Charlie Brown', status: 'Available' },
    ];
  },
  'GET /dashboard/active-trips': async () => {
    await delay(300);
    return trips.filter(t => t.status === 'Dispatched').map(t => ({
      id: t.id,
      code: t.tripCode || 'TR000',
      status: t.status,
      vehicle: vehicles.find(v => v.id === t.vehicleId)?.registrationNumber || 'Unknown',
      driver: drivers.find(d => d.id === t.driverId)?.name || 'Unknown',
      destination: t.destination
    }));
  },
  'GET /dashboard/dispatch-suggestions': async () => {
    await delay(300);
    return [
      { id: 's1', tripCode: 'TR5001', recommendedVehicleId: 'v1', recommendedDriverId: 'd1', reason: 'Best matching capacity and region' },
    ];
  },
  'GET /dashboard/recent-dispatch-activity': async () => {
    await delay(300);
    return [
      { id: '1', type: 'Trip Created', description: 'Dispatched TR4829 to North Region', timestamp: new Date().toISOString() },
    ];
  },
  'GET /vehicles/summary': async () => {
    await delay(300);
    return {
      chartData: [
        { name: 'Mon', value: 20 }, { name: 'Tue', value: 21 },
        { name: 'Wed', value: 22 }, { name: 'Thu', value: 21 },
        { name: 'Fri', value: 23 }, { name: 'Sat', value: 24 }, { name: 'Sun', value: 24 }
      ],
      stats: [
        { label: 'Total Fleet', value: 24 },
        { label: 'Available', value: 15, color: '#48ddbc' },
        { label: 'In Shop', value: 4, color: '#ff6b6b' },
        { label: 'Utilization', value: '75.5%' }
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
  'GET /drivers/summary': async () => {
    await delay(300);
    return {
      chartData: [
        { name: 'Mon', value: 12 }, { name: 'Tue', value: 14 },
        { name: 'Wed', value: 13 }, { name: 'Thu', value: 15 },
        { name: 'Fri', value: 18 }, { name: 'Sat', value: 12 }, { name: 'Sun', value: 10 }
      ],
      stats: [
        { label: 'Total Drivers', value: 35 },
        { label: 'On Duty', value: 18, color: '#558ded' },
        { label: 'Available', value: 10, color: '#48ddbc' },
        { label: 'Avg Safety Score', value: '92%' }
      ]
    };
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
  'GET /trips/summary': async () => {
    await delay(300);
    return {
      chartData: [
        { name: 'Mon', value: 120 }, { name: 'Tue', value: 145 },
        { name: 'Wed', value: 130 }, { name: 'Thu', value: 155 },
        { name: 'Fri', value: 180 }, { name: 'Sat', value: 200 }, { name: 'Sun', value: 110 }
      ],
      stats: [
        { label: 'Total Trips', value: 1040 },
        { label: 'Completed', value: 850, color: '#48ddbc' },
        { label: 'Delayed', value: 15, color: '#ffc633' },
        { label: 'Avg Distance', value: '385 km' }
      ]
    };
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
  'GET /maintenance/summary': async () => {
    await delay(300);
    return {
      chartData: [
        { name: 'Mon', value: 500 }, { name: 'Tue', value: 800 },
        { name: 'Wed', value: 450 }, { name: 'Thu', value: 900 },
        { name: 'Fri', value: 650 }, { name: 'Sat', value: 200 }, { name: 'Sun', value: 100 }
      ],
      stats: [
        { label: 'Active Repairs', value: 4, color: '#ff6b6b' },
        { label: 'Completed (MTD)', value: 18, color: '#48ddbc' },
        { label: 'Total Cost (MTD)', value: '$5,200', color: '#ffc633' },
        { label: 'Avg Downtime', value: '2.5 Days' }
      ]
    };
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
  'GET /expenses/summary': async () => {
    await delay(300);
    return {
      chartData: [
        { name: 'Mon', value: 1200 }, { name: 'Tue', value: 1400 },
        { name: 'Wed', value: 1100 }, { name: 'Thu', value: 1800 },
        { name: 'Fri', value: 1500 }, { name: 'Sat', value: 500 }, { name: 'Sun', value: 300 }
      ],
      stats: [
        { label: 'Total Expenses (MTD)', value: '$48,200', color: '#ff6b6b' },
        { label: 'Fuel Cost', value: '$45,000', color: '#ffc633' },
        { label: 'Maintenance Cost', value: '$2,800', color: '#558ded' },
        { label: 'Avg Cost/Km', value: '$1.24' }
      ]
    };
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

    // Mock Chart Datasets
    const revenueVsCost = [
      { month: 'Jan', revenue: 45000, cost: 32000 },
      { month: 'Feb', revenue: 52000, cost: 35000 },
      { month: 'Mar', revenue: 48000, cost: 33000 },
      { month: 'Apr', revenue: 61000, cost: 41000 },
      { month: 'May', revenue: 59000, cost: 39000 },
      { month: 'Jun', revenue: 65000, cost: 42000 },
    ];

    const fleetUtilizationTrend = [
      { date: 'Mon', utilization: 85 },
      { date: 'Tue', utilization: 88 },
      { date: 'Wed', utilization: 92 },
      { date: 'Thu', utilization: 90 },
      { date: 'Fri', utilization: 95 },
      { date: 'Sat', utilization: 75 },
      { date: 'Sun', utilization: 70 },
    ];

    const fuelCostByVehicleType = [
      { type: 'Heavy Truck', cost: 12000 },
      { type: 'Light Van', cost: 4500 },
      { type: 'Bus', cost: 8500 },
      { type: 'Pickup', cost: 3200 },
    ];

    const topFuelConsumingVehicles = [
      { name: 'TRK-001 (Volvo FH16)', fuel: 2400 },
      { name: 'TRK-005 (Scania R500)', fuel: 2150 },
      { name: 'BUS-012 (Mercedes Tourismo)', fuel: 1900 },
      { name: 'TRK-002 (Volvo FH16)', fuel: 1850 },
      { name: 'VAN-008 (Ford Transit)', fuel: 950 },
    ];

    const maintenanceCostTrend = [
      { month: 'Jan', cost: 5200 },
      { month: 'Feb', cost: 4800 },
      { month: 'Mar', cost: 7100 },
      { month: 'Apr', cost: 4900 },
      { month: 'May', cost: 5500 },
      { month: 'Jun', cost: 6200 },
    ];

    const topMaintenanceCostVehicles = [
      { name: 'TRK-002 (Volvo FH16)', cost: 4500 },
      { name: 'BUS-010 (Mercedes Tourismo)', cost: 3800 },
      { name: 'TRK-001 (Volvo FH16)', cost: 2900 },
      { name: 'VAN-004 (Ford Transit)', cost: 1800 },
      { name: 'TRK-007 (Scania R500)', cost: 1500 },
    ];

    const vehicleTypeDistribution = [
      { type: 'Heavy Truck', count: 12 },
      { type: 'Light Van', count: 8 },
      { type: 'Bus', count: 5 },
      { type: 'Pickup', count: 3 },
    ];

    const expenseDistribution = [
      { expenseType: 'Fuel', amount: 45000 },
      { expenseType: 'Maintenance', amount: 28000 },
      { expenseType: 'Tolls', amount: 8500 },
      { expenseType: 'Insurance', amount: 12000 },
      { expenseType: 'Other', amount: 4500 },
    ];

    const driverPerformanceRanking = [
      { name: 'John Doe', score: 98 },
      { name: 'Jane Smith', score: 95 },
      { name: 'Robert Johnson', score: 92 },
      { name: 'Emily Davis', score: 88 },
      { name: 'Michael Wilson', score: 85 },
    ];

    const tripCompletionTrend = [
      { month: 'Jan', trips: 145 },
      { month: 'Feb', trips: 162 },
      { month: 'Mar', trips: 158 },
      { month: 'Apr', trips: 185 },
      { month: 'May', trips: 178 },
      { month: 'Jun', trips: 195 },
    ];

    const revenueByVehicleType = [
      { type: 'Heavy Truck', revenue: 185000 },
      { type: 'Light Van', revenue: 65000 },
      { type: 'Bus', revenue: 95000 },
      { type: 'Pickup', revenue: 35000 },
    ];

    const vehicleROIChart = [
      { name: 'TRK-001', roi: 18.5 },
      { name: 'TRK-002', roi: 15.2 },
      { name: 'VAN-005', roi: 22.4 },
      { name: 'BUS-012', roi: 12.8 },
      { name: 'TRK-005', roi: 19.1 },
    ];

    const monthlyFuelEfficiency = [
      { month: 'Jan', efficiency: 4.2 },
      { month: 'Feb', efficiency: 4.1 },
      { month: 'Mar', efficiency: 4.4 },
      { month: 'Apr', efficiency: 4.5 },
      { month: 'May', efficiency: 4.3 },
      { month: 'Jun', efficiency: 4.6 },
    ];

    const averageTripDistance = [
      { month: 'Jan', distance: 340 },
      { month: 'Feb', distance: 365 },
      { month: 'Mar', distance: 355 },
      { month: 'Apr', distance: 390 },
      { month: 'May', distance: 385 },
      { month: 'Jun', distance: 410 },
    ];

    const vehicleDowntime = [
      { name: 'TRK-002', days: 12 },
      { name: 'BUS-010', days: 8 },
      { name: 'TRK-001', days: 5 },
      { name: 'VAN-004', days: 3 },
      { name: 'TRK-007', days: 2 },
    ];

    const tripStatusDistribution = [
      { status: 'Completed', count: 850 },
      { status: 'In Progress', count: 45 },
      { status: 'Planned', count: 120 },
      { status: 'Cancelled', count: 15 },
    ];

    return {
      fuelEfficiency,
      fleetUtilization,
      operationalCost,
      vehicleROI,
      monthlyRevenue: cleanMonthlyRevenue,
      topCostliestVehicles,
      totalRevenue,
      totalAcquisition,
      
      revenueVsCost,
      fleetUtilizationTrend,
      fuelCostByVehicleType,
      topFuelConsumingVehicles,
      maintenanceCostTrend,
      topMaintenanceCostVehicles,
      vehicleTypeDistribution,
      expenseDistribution,
      driverPerformanceRanking,
      tripCompletionTrend,
      revenueByVehicleType,
      vehicleROIChart,
      monthlyFuelEfficiency,
      averageTripDistance,
      vehicleDowntime,
      tripStatusDistribution
    };
  }
};

export default handlers;
