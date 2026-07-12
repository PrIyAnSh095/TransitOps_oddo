import { useState, useEffect } from 'react';
import { Download, TrendingUp, Fuel, DollarSign, Activity, Printer } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
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
      `Total Operational Cost (₹),${data.operationalCost.toFixed(2)}`,
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
          <div className="text-3xl font-mono text-white font-bold">₹{(data.operationalCost / 1000).toFixed(1)}k</div>
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

        {/* 1. Revenue vs Cost (Dual Line) */}
        <div className="bg-[#0A0A0A] p-5 rounded-lg border border-[#1F1F1F] space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-white uppercase">Revenue vs Cost</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenueVsCost}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="month" stroke="#5d5f5f" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#5d5f5f" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip cursor={{ fill: '#131313' }} contentStyle={{ backgroundColor: '#050505', border: '1px solid #1F1F1F', borderRadius: '4px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#48ddbc" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="cost" name="Cost" stroke="#ff6b6b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Fleet Utilization (Line) */}
        <div className="bg-[#0A0A0A] p-5 rounded-lg border border-[#1F1F1F] space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-white uppercase">Fleet Utilization (%)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.fleetUtilizationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="date" stroke="#5d5f5f" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#5d5f5f" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip cursor={{ fill: '#131313' }} contentStyle={{ backgroundColor: '#050505', border: '1px solid #1F1F1F', borderRadius: '4px' }} />
                <Line type="monotone" dataKey="utilization" name="Utilization %" stroke="#558ded" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Fuel Cost by Vehicle Type (Bar) */}
        <div className="bg-[#0A0A0A] p-5 rounded-lg border border-[#1F1F1F] space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-white uppercase">Fuel Cost by Vehicle Type</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.fuelCostByVehicleType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="type" stroke="#5d5f5f" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#5d5f5f" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip cursor={{ fill: '#131313' }} contentStyle={{ backgroundColor: '#050505', border: '1px solid #1F1F1F', borderRadius: '4px' }} />
                <Bar dataKey="cost" fill="#ffc633" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Top Fuel Consuming Vehicles (Horizontal Bar) */}
        <div className="bg-[#0A0A0A] p-5 rounded-lg border border-[#1F1F1F] space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-white uppercase">Top Fuel Consuming Vehicles</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topFuelConsumingVehicles} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#5d5f5f" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#c4c7c8" fontSize={10} tickLine={false} axisLine={false} width={120} />
                <Tooltip cursor={{ fill: '#131313' }} contentStyle={{ backgroundColor: '#050505', border: '1px solid #1F1F1F', borderRadius: '4px' }} />
                <Bar dataKey="fuel" fill="#ffb4ab" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Maintenance Cost Trend (Line) */}
        <div className="bg-[#0A0A0A] p-5 rounded-lg border border-[#1F1F1F] space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-white uppercase">Maintenance Cost Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.maintenanceCostTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="month" stroke="#5d5f5f" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#5d5f5f" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip cursor={{ fill: '#131313' }} contentStyle={{ backgroundColor: '#050505', border: '1px solid #1F1F1F', borderRadius: '4px' }} />
                <Line type="monotone" dataKey="cost" name="Cost" stroke="#ff6b6b" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Top Maintenance Cost Vehicles (Horizontal Bar) */}
        <div className="bg-[#0A0A0A] p-5 rounded-lg border border-[#1F1F1F] space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-white uppercase">Top Maintenance Cost Vehicles</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topMaintenanceCostVehicles} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#5d5f5f" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#c4c7c8" fontSize={10} tickLine={false} axisLine={false} width={120} />
                <Tooltip cursor={{ fill: '#131313' }} contentStyle={{ backgroundColor: '#050505', border: '1px solid #1F1F1F', borderRadius: '4px' }} />
                <Bar dataKey="cost" fill="#ff6b6b" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7. Vehicle Type Distribution (Doughnut) */}
        <div className="bg-[#0A0A0A] p-5 rounded-lg border border-[#1F1F1F] space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-white uppercase">Vehicle Type Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.vehicleTypeDistribution} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="count" nameKey="type">
                  {data.vehicleTypeDistribution.map((_entry, index) => {
                    const colors = ['#48ddbc', '#558ded', '#ffc633', '#ff6b6b'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#050505', border: '1px solid #1F1F1F', borderRadius: '4px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 8. Expense Distribution (Doughnut) */}
        <div className="bg-[#0A0A0A] p-5 rounded-lg border border-[#1F1F1F] space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-white uppercase">Expense Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.expenseDistribution} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="amount" nameKey="expenseType">
                  {data.expenseDistribution.map((_entry, index) => {
                    const colors = ['#ffc633', '#ff6b6b', '#558ded', '#48ddbc', '#8e9192'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip formatter={(val) => `₹${val}`} contentStyle={{ backgroundColor: '#050505', border: '1px solid #1F1F1F', borderRadius: '4px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 9. Driver Performance Ranking (Horizontal Bar) */}
        <div className="bg-[#0A0A0A] p-5 rounded-lg border border-[#1F1F1F] space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-white uppercase">Driver Performance Ranking</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.driverPerformanceRanking} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#5d5f5f" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#c4c7c8" fontSize={10} tickLine={false} axisLine={false} width={100} />
                <Tooltip cursor={{ fill: '#131313' }} contentStyle={{ backgroundColor: '#050505', border: '1px solid #1F1F1F', borderRadius: '4px' }} />
                <Bar dataKey="score" fill="#48ddbc" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 10. Trip Completion Trend (Line) */}
        <div className="bg-[#0A0A0A] p-5 rounded-lg border border-[#1F1F1F] space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-white uppercase">Trip Completion Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.tripCompletionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="month" stroke="#5d5f5f" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#5d5f5f" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#131313' }} contentStyle={{ backgroundColor: '#050505', border: '1px solid #1F1F1F', borderRadius: '4px' }} />
                <Line type="monotone" dataKey="trips" name="Completed Trips" stroke="#558ded" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 11. Revenue by Vehicle Type (Bar) */}
        <div className="bg-[#0A0A0A] p-5 rounded-lg border border-[#1F1F1F] space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-white uppercase">Revenue by Vehicle Type</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenueByVehicleType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="type" stroke="#5d5f5f" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#5d5f5f" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip cursor={{ fill: '#131313' }} contentStyle={{ backgroundColor: '#050505', border: '1px solid #1F1F1F', borderRadius: '4px' }} />
                <Bar dataKey="revenue" fill="#48ddbc" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 12. Vehicle ROI (Bar) */}
        <div className="bg-[#0A0A0A] p-5 rounded-lg border border-[#1F1F1F] space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-white uppercase">Vehicle ROI (%)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.vehicleROIChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="name" stroke="#5d5f5f" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#5d5f5f" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip cursor={{ fill: '#131313' }} contentStyle={{ backgroundColor: '#050505', border: '1px solid #1F1F1F', borderRadius: '4px' }} />
                <Bar dataKey="roi" fill="#558ded" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 13. Monthly Fuel Efficiency (Line) */}
        <div className="bg-[#0A0A0A] p-5 rounded-lg border border-[#1F1F1F] space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-white uppercase">Monthly Fuel Efficiency</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyFuelEfficiency}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="month" stroke="#5d5f5f" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#5d5f5f" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val} km/L`} />
                <Tooltip cursor={{ fill: '#131313' }} contentStyle={{ backgroundColor: '#050505', border: '1px solid #1F1F1F', borderRadius: '4px' }} />
                <Line type="monotone" dataKey="efficiency" name="Efficiency (km/L)" stroke="#48ddbc" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 14. Average Trip Distance (Line) */}
        <div className="bg-[#0A0A0A] p-5 rounded-lg border border-[#1F1F1F] space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-white uppercase">Average Trip Distance</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.averageTripDistance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="month" stroke="#5d5f5f" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#5d5f5f" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val} km`} />
                <Tooltip cursor={{ fill: '#131313' }} contentStyle={{ backgroundColor: '#050505', border: '1px solid #1F1F1F', borderRadius: '4px' }} />
                <Line type="monotone" dataKey="distance" name="Distance (km)" stroke="#ffc633" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 15. Vehicle Downtime (Horizontal Bar) */}
        <div className="bg-[#0A0A0A] p-5 rounded-lg border border-[#1F1F1F] space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-white uppercase">Vehicle Downtime</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.vehicleDowntime} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#5d5f5f" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#c4c7c8" fontSize={10} tickLine={false} axisLine={false} width={100} />
                <Tooltip cursor={{ fill: '#131313' }} contentStyle={{ backgroundColor: '#050505', border: '1px solid #1F1F1F', borderRadius: '4px' }} />
                <Bar dataKey="days" name="Days in Shop" fill="#ffb4ab" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 16. Trip Status Distribution (Doughnut) */}
        <div className="bg-[#0A0A0A] p-5 rounded-lg border border-[#1F1F1F] space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-white uppercase">Trip Status Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.tripStatusDistribution} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="count" nameKey="status">
                  {data.tripStatusDistribution.map((_entry, index) => {
                    const colors = ['#48ddbc', '#ffc633', '#558ded', '#ff6b6b'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#050505', border: '1px solid #1F1F1F', borderRadius: '4px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
