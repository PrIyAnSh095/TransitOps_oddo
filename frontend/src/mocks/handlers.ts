import type { User, Vehicle, Driver } from '../types';
import { mockVehicles, mockDrivers } from './data.ts';

// Mock users for different roles
const mockUsers: Record<string, User> = {
  'fleet@test.com': { id: 'u1', name: 'Fleet Manager', email: 'fleet@test.com', role: 'FleetManager', createdAt: new Date().toISOString() },
  'dispatcher@test.com': { id: 'u2', name: 'Dispatcher', email: 'dispatcher@test.com', role: 'Dispatcher', createdAt: new Date().toISOString() },
  'safety@test.com': { id: 'u3', name: 'Safety Officer', email: 'safety@test.com', role: 'SafetyOfficer', createdAt: new Date().toISOString() },
  'finance@test.com': { id: 'u4', name: 'Financial Analyst', email: 'finance@test.com', role: 'FinancialAnalyst', createdAt: new Date().toISOString() },
};

let vehicles = [...mockVehicles];
let drivers = [...mockDrivers];

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
  }
};

export default handlers;
