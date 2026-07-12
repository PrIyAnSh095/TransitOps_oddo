import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  MapPin, 
  Wrench, 
  CreditCard, 
  BarChart3, 
  Settings,
  LogOut,
  Search,
  Bell,
  Terminal,
  Menu,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../lib/utils';

type NavItem = {
  name: string;
  path: string;
  icon: any;
  roles: UserRole[];
};

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['FleetManager', 'Dispatcher', 'SafetyOfficer', 'FinancialAnalyst'] },
  { name: 'Vehicles', path: '/vehicles', icon: Truck, roles: ['FleetManager', 'Dispatcher', 'FinancialAnalyst'] },
  { name: 'Drivers', path: '/drivers', icon: Users, roles: ['FleetManager', 'Dispatcher', 'SafetyOfficer'] },
  { name: 'Dispatch', path: '/trips', icon: MapPin, roles: ['FleetManager', 'Dispatcher', 'SafetyOfficer'] },
  { name: 'Maintenance', path: '/maintenance', icon: Wrench, roles: ['FleetManager', 'FinancialAnalyst'] },
  { name: 'Fuel & Expenses', path: '/expenses', icon: CreditCard, roles: ['FleetManager', 'FinancialAnalyst'] },
  { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['FleetManager', 'SafetyOfficer', 'FinancialAnalyst'] },
  { name: 'Settings', path: '/settings', icon: Settings, roles: ['FleetManager'] },
];

export function AppShell() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!user) return null;

  const allowedNavItems = navItems.filter(item => item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a] text-[#e5e2e1] font-sans selection:bg-[#404040]">
      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-[#131313] border-r border-[#1F1F1F] transition-all duration-300 ease-in-out lg:relative lg:translate-x-0",
          isCollapsed ? "w-[72px]" : "w-64",
          !isMobileOpen && "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#1F1F1F]">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded bg-[#171717] border border-[#262626]">
              <Terminal size={18} className="text-white" />
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-lg text-white font-mono truncate">TransitOps</span>
            )}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded hover:bg-[#201f1f] text-[#8e9192]"
          >
            <ChevronLeft size={16} className={cn("transition-transform", isCollapsed && "rotate-180")} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
          {allowedNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors group",
                  isActive 
                    ? "bg-[#201f1f] text-white font-medium" 
                    : "text-[#c4c7c8] hover:bg-[#1c1b1b] hover:text-white"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon size={18} className={cn("flex-shrink-0", isActive ? "text-white" : "text-[#8e9192] group-hover:text-white")} />
                {!isCollapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </div>

        <div className="p-4 border-t border-[#1F1F1F]">
          <div className={cn("flex items-center gap-3", isCollapsed ? "justify-center" : "")}>
            <div className="w-8 h-8 rounded-full bg-[#201f1f] border border-[#353534] flex items-center justify-center flex-shrink-0 uppercase text-xs font-bold text-white">
              {user.name.charAt(0)}
            </div>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-[#8e9192] truncate">{user.role}</p>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className={cn(
              "mt-4 flex items-center gap-2 text-sm text-[#ffb4ab] hover:text-[#ffdad6] transition-colors w-full",
              isCollapsed ? "justify-center" : "px-2"
            )}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut size={16} />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-[#131313]/80 backdrop-blur-md border-b border-[#1F1F1F] sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-[#c4c7c8] hover:text-white"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#050505] border border-[#1F1F1F] rounded-md text-[#5d5f5f] focus-within:border-white focus-within:text-white transition-colors w-64 lg:w-96">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none focus:outline-none text-sm text-white w-full font-mono placeholder:text-[#5d5f5f]"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-[#c4c7c8] hover:text-white hover:bg-[#1c1b1b] rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-white rounded-full border-2 border-[#131313]" />
            </button>
            <div className="hidden sm:block text-xs font-mono px-2 py-1 bg-[#1c1b1b] border border-[#2a2a2a] text-[#c4c7c8] rounded">
              {user.role}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
