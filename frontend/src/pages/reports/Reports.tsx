import { useState, useEffect } from 'react';
import { Download, TrendingUp, Truck, Fuel, DollarSign, Activity, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getAnalytics, type AnalyticsPayload } from '../../services/reports.ts';
import { LoadingBuffer } from '../../components/ui/Loading.tsx';
import { useAuthStore } from '../../store/authStore';

export default function Reports() {
  const { user } = useAuthStore();
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getAnalytics();
        setData(res);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExportCSV = () => {
    if (!data) return;
    
    // Prepare CSV rows for Top Costliest Vehicles
    const headers = ['Vehicle_ID', 'Registration/Name', 'Total_Cost', 'Estimated_Revenue', 'Acquisition_Cost', 'ROI_Percentage'];
    const rows = data.topCostliestVehicles.map(v => {
      const roi = v.acquisitionCost > 0 ? ((v.revenue - v.cost) / v.acquisitionCost) * 100 : 0;
      return [
        v.id,
        v.name.replace(/,/g, ''), // safe CSV string
        v.cost.toFixed(2),
        v.revenue.toFixed(2),
        v.acquisitionCost.toFixed(2),
        roi.toFixed(2) + '%'
      ].join(',');
    });

    const csvContent = [
      'Report Generation Date: ' + new Date().toISOString(),
      '',
      `Fleet Utilization (%),${data.fleetUtilization.toFixed(1)}%`,
      `Overall Fuel Efficiency (km/L),${data.fuelEfficiency.toFixed(2)}`,
      `Total Operational Cost ($),${data.operationalCost.toFixed(2)}`,
      `Average Vehicle ROI (%),${data.vehicleROI.toFixed(2)}%`,
      '',
      headers.join(','),
      ...rows
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transitops_analytics_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) throw error;
  if (loading || !data) return <LoadingBuffer message="Generating Analytics..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white font-sans">Reports & Analytics</h2>
          <p className="text-sm text-[#8e9192]">Executive fleet performance overview</p>
        </div>
        {user?.role !== 'SafetyOfficer' && (
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-transparent border border-[#262626] text-white text-sm font-medium rounded hover:bg-[#131313] transition-colors"
            >
              <Printer size={16} /> Export PDF
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-[#e5e2e1] transition-colors"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0A0A0A] p-5 rounded-lg border border-[#1F1F1F] flex flex-col justify-between">
          <div className="flex items-center gap-3 text-[#c4c7c8] mb-2">
            <Fuel size={20} className="text-[#48ddbc]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Avg Fuel Efficiency</h3>
          </div>
          <div className="text-3xl font-mono text-white font-bold">{data.fuelEfficiency.toFixed(2)} <span className="text-sm text-[#5d5f5f] font-sans font-normal">km/L</span></div>
        </div>

        <div className="bg-[#0A0A0A] p-5 rounded-lg border border-[#1F1F1F] flex flex-col justify-between">
          <div className="flex items-center gap-3 text-[#c4c7c8] mb-2">
            <Activity size={20} className="text-[#ffc633]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Fleet Utilization</h3>
          </div>
          <div className="text-3xl font-mono text-white font-bold">{data.fleetUtilization.toFixed(1)}%</div>
        </div>

        <div className="bg-[#0A0A0A] p-5 rounded-lg border border-[#1F1F1F] flex flex-col justify-between">
          <div className="flex items-center gap-3 text-[#c4c7c8] mb-2">
            <DollarSign size={20} className="text-[#ff6b6b]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Operational Cost</h3>
          </div>
          <div className="text-3xl font-mono text-white font-bold">${(data.operationalCost / 1000).toFixed(1)}k</div>
        </div>

        <div className="bg-[#0A0A0A] p-5 rounded-lg border border-[#1F1F1F] flex flex-col justify-between">
          <div className="flex items-center gap-3 text-[#c4c7c8] mb-2">
            <TrendingUp size={20} className="text-[#48ddbc]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Avg Vehicle ROI</h3>
          </div>
          <div className="text-3xl font-mono text-white font-bold">{data.vehicleROI.toFixed(1)}%</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0A0A0A] p-5 rounded-lg border border-[#1F1F1F] space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-white uppercase">Monthly Revenue Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="month" stroke="#5d5f5f" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#5d5f5f" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip 
                  cursor={{ fill: '#131313' }}
                  contentStyle={{ backgroundColor: '#050505', border: '1px solid #1F1F1F', borderRadius: '4px' }}
                  itemStyle={{ color: '#48ddbc' }}
                  labelStyle={{ color: '#c4c7c8' }}
                />
                <Bar dataKey="revenue" fill="#48ddbc" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0A0A0A] p-5 rounded-lg border border-[#1F1F1F] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-tight text-white uppercase flex items-center gap-2">
              <Truck size={16} className="text-[#ff6b6b]" /> Costliest Vehicles
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topCostliestVehicles} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#5d5f5f" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#c4c7c8" fontSize={12} tickLine={false} axisLine={false} width={100} />
                <Tooltip 
                  cursor={{ fill: '#131313' }}
                  contentStyle={{ backgroundColor: '#050505', border: '1px solid #1F1F1F', borderRadius: '4px' }}
                  itemStyle={{ color: '#ff6b6b' }}
                  labelStyle={{ color: '#c4c7c8' }}
                  formatter={(val: any) => [`$${Number(val || 0).toFixed(2)}`, 'Cost']}
                />
                <Bar dataKey="cost" fill="#ff6b6b" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
