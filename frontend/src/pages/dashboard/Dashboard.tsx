import { useAuthStore } from '../../store/authStore';
import { ManagerDashboard } from './ManagerDashboard.tsx';
import { DispatcherDashboard } from './DispatcherDashboard.tsx';

export default function Dashboard() {
  const { user } = useAuthStore();

  if (!user) return null;

  if (user.role === 'Dispatcher') {
    return <DispatcherDashboard />;
  }

  // FleetManager, SafetyOfficer, FinancialAnalyst
  return <ManagerDashboard />;
}
