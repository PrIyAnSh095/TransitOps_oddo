import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Login } from './pages/auth/Login';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { GoogleOAuthError } from './pages/auth/GoogleOAuthError';
import { AppShell } from './layouts/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';

// Placeholder Pages
const Dashboard = () => <div className="p-4 text-white">Dashboard Page - Implement in Phase 2</div>;
const Vehicles = () => <div className="p-4 text-white">Vehicles Page - Implement in Phase 3</div>;
const Drivers = () => <div className="p-4 text-white">Drivers Page - Implement in Phase 4</div>;
const Trips = () => <div className="p-4 text-white">Trips Page - Implement in Phase 5</div>;
const Maintenance = () => <div className="p-4 text-white">Maintenance Page - Implement in Phase 6</div>;
const Expenses = () => <div className="p-4 text-white">Expenses Page - Implement in Phase 7</div>;
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
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/auth/google-error" element={<GoogleOAuthError />} />
        
        {/* Protected Routes inside App Shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard available to everyone */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Role specific routes based on RBAC matrix */}
            <Route element={<ProtectedRoute allowedRoles={['FleetManager', 'Dispatcher', 'FinancialAnalyst']} />}>
              <Route path="/vehicles" element={<Vehicles />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['FleetManager', 'Dispatcher', 'SafetyOfficer']} />}>
              <Route path="/drivers" element={<Drivers />} />
              <Route path="/trips" element={<Trips />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['FleetManager', 'FinancialAnalyst']} />}>
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/expenses" element={<Expenses />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['FleetManager', 'SafetyOfficer', 'FinancialAnalyst']} />}>
              <Route path="/reports" element={<Reports />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['FleetManager']} />}>
              <Route path="/settings" element={<Settings />} />
            </Route>

          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
