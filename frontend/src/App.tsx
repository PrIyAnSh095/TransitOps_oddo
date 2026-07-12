import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Login } from './pages/auth/Login';
import { AppShell } from './layouts/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotFound } from './pages/NotFound';

// Placeholder Pages
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard.tsx'));
const Vehicles = lazy(() => import('./pages/vehicles/Vehicles.tsx'));
const Drivers = lazy(() => import('./pages/drivers/Drivers.tsx'));
const Trips = lazy(() => import('./pages/trips/Trips.tsx'));
const Maintenance = lazy(() => import('./pages/maintenance/Maintenance.tsx'));
const Expenses = lazy(() => import('./pages/expenses/Expenses.tsx'));
const Reports = () => <div className="p-4 text-white">Reports Page - Implement in Phase 8</div>;
const Settings = () => <div className="p-4 text-white">Settings Page - Implement in Phase 10</div>;

export default function App() {
  const { restoreSession, isLoading } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505] text-white">
        <div className="animate-pulse font-mono text-sm tracking-wider uppercase text-[#8e9192]">Initializing System...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
        
        {/* Protected Routes inside App Shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard available to everyone */}
            <Route path="/dashboard" element={
              <Suspense fallback={<div className="p-8 text-white"><span className="animate-pulse">Loading dashboard buffer...</span></div>}>
                <Dashboard />
              </Suspense>
            } />
            
            {/* Role specific routes based on RBAC matrix */}
            <Route element={<ProtectedRoute allowedRoles={['FleetManager', 'Dispatcher', 'FinancialAnalyst']} />}>
              <Route path="/vehicles" element={
                <Suspense fallback={<div className="p-8 text-white"><span className="animate-pulse">Loading vehicle registry...</span></div>}>
                  <Vehicles />
                </Suspense>
              } />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['FleetManager', 'Dispatcher', 'SafetyOfficer']} />}>
              <Route path="/drivers" element={
                <Suspense fallback={<div className="p-8 text-white"><span className="animate-pulse">Loading driver management...</span></div>}>
                  <Drivers />
                </Suspense>
              } />
              <Route path="/trips" element={
                <Suspense fallback={<div className="p-8 text-white"><span className="animate-pulse">Loading trips...</span></div>}>
                  <Trips />
                </Suspense>
              } />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['FleetManager', 'FinancialAnalyst']} />}>
              <Route path="/maintenance" element={
                <Suspense fallback={<div className="p-8 text-white"><span className="animate-pulse">Loading maintenance...</span></div>}>
                  <Maintenance />
                </Suspense>
              } />
              <Route path="/expenses" element={
                <Suspense fallback={<div className="p-8 text-white"><span className="animate-pulse">Loading expenses...</span></div>}>
                  <Expenses />
                </Suspense>
              } />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['FleetManager', 'SafetyOfficer', 'FinancialAnalyst']} />}>
              <Route path="/reports" element={<Reports />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['FleetManager']} />}>
              <Route path="/settings" element={<Settings />} />
            </Route>

          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
