import { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { Truck, Navigation, Users, Wrench, DollarSign, Wallet, Percent, ShieldAlert } from 'lucide-react';
import { 
  getManagerKPIs, getFleetStatus, getDriverStatus, getTripsTrend, 
  getFuelTrend, getCostBreakdown, getRecentActivity, getAlerts,
  type ManagerKPIs, type PieChartData, type LineChartData, type ActivityFeedItem, type AlertItem
} from '../../services/dashboard';
import { LoadingBuffer } from '../../components/ui/Loading';
import { KPICard } from '../../components/ui/KPICard';
import { Link } from 'react-router-dom';

export function ManagerDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const [kpis, setKpis] = useState<ManagerKPIs | null>(null);
  const [fleetStatus, setFleetStatus] = useState<PieChartData[]>([]);
  const [driverStatus, setDriverStatus] = useState<PieChartData[]>([]);
  const [tripsTrend, setTripsTrend] = useState<LineChartData[]>([]);
  const [fuelTrend, setFuelTrend] = useState<LineChartData[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<PieChartData[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityFeedItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getManagerKPIs(), getFleetStatus(), getDriverStatus(), getTripsTrend(),
      getFuelTrend(), getCostBreakdown(), getRecentActivity(), getAlerts()
    ]).then(results => {
      if (mounted) {
        setKpis(results[0]);
        setFleetStatus(results[1]);
        setDriverStatus(results[2]);
        setTripsTrend(results[3]);
        setFuelTrend(results[4]);
        setCostBreakdown(results[5]);
        setRecentActivity(results[6]);
        setAlerts(results[7]);
        setLoading(false);
      }
    }).catch(err => {
      if (mounted) {
        setError(err);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  if (error) throw error;
  if (loading || !kpis) return <LoadingBuffer message="Loading Executive Dashboard..." />;

  const formatCurrency = (val: number) => `₹${(val / 1000).toFixed(1)}k`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-white font-sans">Executive Fleet Command Center</h2>
      </div>

      {/* ROW 1: 8 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Vehicles" value={kpis.totalVehicles} icon={Truck} linkTo="/vehicles" color="#48ddbc" />
        <KPICard title="Available Vehicles" value={kpis.availableVehicles} icon={Truck} linkTo="/vehicles" color="#558ded" />
        <KPICard title="Active Trips" value={kpis.activeTrips} icon={Navigation} linkTo="/trips" color="#ffc633" />
        <KPICard title="Drivers On Duty" value={kpis.driversOnDuty} icon={Users} linkTo="/drivers" color="#558ded" />
        <KPICard title="Vehicles In Shop" value={kpis.vehiclesInMaintenance} icon={Wrench} linkTo="/maintenance" color="#ff6b6b" />
        <KPICard title="Fleet Utilization" value={`${kpis.fleetUtilization}%`} icon={Percent} linkTo="/reports" color="#48ddbc" trend={{ value: '+2.4%', isPositive: true }} />
        <KPICard title="Monthly Revenue" value={formatCurrency(kpis.monthlyRevenue)} icon={DollarSign} linkTo="/reports" color="#ffc633" />
        <KPICard title="Operational Cost" value={formatCurrency(kpis.monthlyOperationalCost)} icon={Wallet} linkTo="/expenses" color="#ff6b6b" />
      </div>

      {/* ROW 2: Fleet & Driver Status (Pie Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#c4c7c8]">Fleet Status</h3>
            <Link to="/vehicles" className="text-xs text-[#5d5f5f] hover:text-white uppercase font-bold tracking-wider">View Details</Link>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={fleetStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" nameKey="name">
                  {fleetStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#131313', border: '1px solid #262626', borderRadius: '4px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#c4c7c8]">Driver Status</h3>
            <Link to="/drivers" className="text-xs text-[#5d5f5f] hover:text-white uppercase font-bold tracking-wider">View Details</Link>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={driverStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" nameKey="name">
                  {driverStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#131313', border: '1px solid #262626', borderRadius: '4px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROW 3: Trends (Line Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#c4c7c8]">Trip Trend (7 Days)</h3>
            <Link to="/reports" className="text-xs text-[#5d5f5f] hover:text-white uppercase font-bold tracking-wider">View Details</Link>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tripsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="name" stroke="#5d5f5f" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis stroke="#5d5f5f" tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#131313', border: '1px solid #262626', borderRadius: '4px' }} />
                <Line type="monotone" dataKey="value" name="Trips" stroke="#48ddbc" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#c4c7c8]">Fuel Consumption (7 Days)</h3>
            <Link to="/reports" className="text-xs text-[#5d5f5f] hover:text-white uppercase font-bold tracking-wider">View Details</Link>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fuelTrend}>
                <defs>
                  <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffc633" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ffc633" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="name" stroke="#5d5f5f" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis stroke="#5d5f5f" tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#131313', border: '1px solid #262626', borderRadius: '4px' }} />
                <Area type="monotone" dataKey="value" name="Fuel (L)" stroke="#ffc633" strokeWidth={3} fillOpacity={1} fill="url(#colorFuel)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROW 4: Cost Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#c4c7c8]">Cost Breakdown</h3>
            <Link to="/reports" className="text-xs text-[#5d5f5f] hover:text-white uppercase font-bold tracking-wider">View Details</Link>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={costBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" nameKey="name">
                  {costBreakdown.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(val: any) => `₹${val}`} contentStyle={{ backgroundColor: '#131313', border: '1px solid #262626', borderRadius: '4px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-5 lg:col-span-2 flex flex-col">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#c4c7c8] mb-4">Recent Activity Feed</h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-[#131313] border border-[#1F1F1F] rounded-md">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#558ded]" />
                  <div>
                    <p className="text-sm font-bold text-white">{activity.type}</p>
                    <p className="text-xs text-[#8e9192]">{activity.description}</p>
                  </div>
                </div>
                <span className="text-xs text-[#5d5f5f] font-mono">
                  {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 5: Alerts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#1f1111] border border-[#4a1c1c] rounded-lg p-5 lg:col-span-2 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert size={18} className="text-[#ff6b6b]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#ffb4ab]">System Alerts</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
            {alerts.length === 0 ? (
              <p className="text-sm text-[#ffb4ab] opacity-70">No active alerts.</p>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-[#2a0808] border border-[#4a1c1c] rounded-md">
                  <div>
                    <p className="text-xs font-bold text-[#ffb4ab] uppercase tracking-wider">{alert.type}</p>
                    <p className="text-sm text-white">{alert.message}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
                    alert.severity === 'high' ? 'bg-[#ff6b6b]/20 text-[#ffb4ab] border-[#ff6b6b]/50' : 'bg-[#ffc633]/20 text-[#ffc633] border-[#ffc633]/50'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#c4c7c8] mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link to="/vehicles" className="block p-3 bg-[#131313] hover:bg-[#1a1a1a] border border-[#1F1F1F] rounded-md text-sm font-bold text-white text-center transition-colors">
              Add Vehicle
            </Link>
            <Link to="/drivers" className="block p-3 bg-[#131313] hover:bg-[#1a1a1a] border border-[#1F1F1F] rounded-md text-sm font-bold text-white text-center transition-colors">
              Add Driver
            </Link>
            <Link to="/trips" className="block p-3 bg-[#558ded] hover:bg-[#407ad6] border border-[#558ded] rounded-md text-sm font-bold text-white text-center transition-colors">
              Create Trip
            </Link>
            <Link to="/expenses" className="block p-3 bg-[#131313] hover:bg-[#1a1a1a] border border-[#1F1F1F] rounded-md text-sm font-bold text-white text-center transition-colors">
              Log Fuel / Expense
            </Link>
            <Link to="/maintenance" className="block p-3 bg-[#131313] hover:bg-[#1a1a1a] border border-[#1F1F1F] rounded-md text-sm font-bold text-white text-center transition-colors">
              Log Maintenance
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
