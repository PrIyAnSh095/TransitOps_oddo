import type { User } from '../types';

// Mock users for different roles
const mockUsers: Record<string, User> = {
  'fleet@test.com': { id: 'u1', name: 'Fleet Manager', email: 'fleet@test.com', role: 'FleetManager', createdAt: new Date().toISOString() },
  'dispatcher@test.com': { id: 'u2', name: 'Dispatcher', email: 'dispatcher@test.com', role: 'Dispatcher', createdAt: new Date().toISOString() },
  'safety@test.com': { id: 'u3', name: 'Safety Officer', email: 'safety@test.com', role: 'SafetyOfficer', createdAt: new Date().toISOString() },
  'finance@test.com': { id: 'u4', name: 'Financial Analyst', email: 'finance@test.com', role: 'FinancialAnalyst', createdAt: new Date().toISOString() },
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const handlers: Record<string, (body?: any) => Promise<any>> = {
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
  }
};

export default handlers;
