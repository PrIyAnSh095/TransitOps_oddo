import { useEffect, useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Truck, AlertTriangle, Route, Users } from 'lucide-react';
import { getDashboardKPIs, type KPIResponse } from '../../services/dashboard';
import { LoadingBuffer } from '../../components/ui/Loading';

export function ManagerDashboard() {
  const [data, setData] = useState<KPIResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    getDashboardKPIs()
      .then(res => {
        if (mounted) setData(res);
      })
      .catch(err => {
        if (mounted) setError(err);
      });
    return () => { mounted = false; };
  }, []);

  if (error) {
    throw error; // Let ErrorBoundary handle it
  }

  if (!data) {
    return <LoadingBuffer message="Loading Metrics..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-white font-sans">Fleet Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI Cards */}
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-5">
          <div className="flex items-center gap-3 text-[#c4c7c8] mb-3">
            <Truck size={18} />
            <h3 className="text-xs font-semibold uppercase tracking-wider">Active Vehicles</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">{data.activeVehicles}</span>
            <span className="text-sm text-[#8e9192]">/ {data.totalVehicles}</span>
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-5">
          <div className="flex items-center gap-3 text-[#c4c7c8] mb-3">
            <Route size={18} />
            <h3 className="text-xs font-semibold uppercase tracking-wider">Active Trips</h3>
          </div>
          <div className="text-3xl font-bold text-white font-mono">{data.activeTrips}</div>
        </div>

        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-5">
          <div className="flex items-center gap-3 text-[#c4c7c8] mb-3">
            <Users size={18} />
            <h3 className="text-xs font-semibold uppercase tracking-wider">Total Drivers</h3>
          </div>
          <div className="text-3xl font-bold text-white font-mono">{data.totalDrivers}</div>
        </div>

        <div className="bg-[#1f1111] border border-[#4a1c1c] rounded-lg p-5">
          <div className="flex items-center gap-3 text-[#ffb4ab] mb-3">
            <AlertTriangle size={18} />
            <h3 className="text-xs font-semibold uppercase tracking-wider">Active Alerts</h3>
          </div>
          <div className="text-3xl font-bold text-[#ffb4ab] font-mono">{data.alerts}</div>
        </div>
      </div>

      <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#c4c7c8] mb-6">7-Day Fuel & Maintenance Cost Trend</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
              <XAxis dataKey="name" stroke="#5d5f5f" tick={{ fill: '#8e9192', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#5d5f5f" tick={{ fill: '#8e9192', fontSize: 12, fontFamily: 'monospace' }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#131313', border: '1px solid #262626', borderRadius: '4px', fontFamily: 'monospace' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="cost" stroke="#ffffff" fillOpacity={1} fill="url(#colorCost)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
