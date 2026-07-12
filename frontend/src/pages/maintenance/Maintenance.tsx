import { useState, useEffect } from 'react';
import { Plus, CheckCircle, Wrench, AlertTriangle, Search } from 'lucide-react';
import { getMaintenanceLogs, closeMaintenanceLog, getMaintenanceSummary } from '../../services/maintenance.ts';
import { getVehicles, type SummaryData } from '../../services/vehicles.ts';
import type { MaintenanceLog, Vehicle } from '../../types';
import { LoadingBuffer } from '../../components/ui/Loading.tsx';
import { SummaryCard } from '../../components/ui/SummaryCard.tsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MaintenanceModal } from './MaintenanceModal.tsx';
import { useAuthStore } from '../../store/authStore';

export default function Maintenance() {
  const { user } = useAuthStore();
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [period, setPeriod] = useState('monthly');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const filters: Record<string, string> = { search, status: statusFilter, period };
      if (vehicleFilter !== 'All') {
        filters.vehicle = vehicleFilter;
      }
      
      const [logsData, vehiclesData, sData] = await Promise.all([
        getMaintenanceLogs(filters),
        getVehicles(),
        getMaintenanceSummary(filters)
      ]);
      setLogs(logsData);
      setVehicles(vehiclesData);
      setSummary(sData);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter, vehicleFilter, period]);

  const handleClose = async (log: MaintenanceLog) => {
    if (window.confirm(`Are you sure you want to close this maintenance record?`)) {
      try {
        const updated = await closeMaintenanceLog(log.id);
        setLogs(prev => prev.map(l => l.id === updated.id ? updated : l));
      } catch (err: any) {
        alert(err.message || 'Failed to close record');
      }
    }
  };

  const filteredLogs = logs;

  if (error) throw error;
  if (loading) return <LoadingBuffer message="Loading Maintenance Records..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold tracking-tight text-white font-sans">Maintenance Management</h2>
        {user?.role === 'FleetManager' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-[#e5e2e1] transition-colors"
          >
            <Plus size={16} /> New Record
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-[#0A0A0A] p-4 rounded-lg border border-[#1F1F1F]">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5d5f5f]" />
          <input
            type="text"
            placeholder="Search notes or service type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white text-sm focus:outline-none focus:border-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white text-sm focus:outline-none focus:border-white"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
        </select>
        <select
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value)}
          className="px-4 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white text-sm focus:outline-none focus:border-white appearance-none max-w-[250px]"
        >
          <option value="All">All Vehicles</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>{v.registrationNumber}</option>
          ))}
        </select>
      </div>

      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
          {loading && (
            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center rounded-lg backdrop-blur-sm">
              <div className="w-8 h-8 border-4 border-[#ff6b6b] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-5 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#c4c7c8]">Maintenance Cost</h3>
              <select 
                value={period} 
                onChange={(e) => setPeriod(e.target.value)}
                className="bg-[#131313] border border-[#262626] text-[#c4c7c8] text-xs px-2 py-1 rounded focus:outline-none"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.chartData}>
                  <defs>
                    <linearGradient id="colorMaintenance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                  <XAxis dataKey="name" stroke="#5d5f5f" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis stroke="#5d5f5f" tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#131313', border: '1px solid #262626', borderRadius: '4px' }} />
                  <Area type="monotone" dataKey="value" stroke="#ff6b6b" strokeWidth={3} fillOpacity={1} fill="url(#colorMaintenance)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="lg:col-span-1">
            <SummaryCard title="Maintenance Summary" stats={summary.stats.map(s => ({ label: s.label, value: s.value, color: s.color }))} />
          </div>
        </div>
      )}

      <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg overflow-x-auto relative">
        {loading && (
          <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center backdrop-blur-sm">
            <div className="w-8 h-8 border-4 border-[#ff6b6b] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <table className="w-full text-left text-sm text-[#c4c7c8]">
          <thead className="bg-[#131313] border-b border-[#1F1F1F] text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4">Vehicle</th>
              <th className="p-4">Service Type</th>
              <th className="p-4">Date</th>
              <th className="p-4">Cost</th>
              <th className="p-4">Status</th>
              {user?.role === 'FleetManager' && <th className="p-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F1F1F]">
            {filteredLogs.map(log => {
              const vehicle = vehicles.find(v => v.id === log.vehicleId);
              return (
                <tr key={log.id} className="hover:bg-[#131313] transition-colors">
                  <td className="p-4">
                    {vehicle ? (
                      <div>
                        <span className="text-white font-medium">{vehicle.registrationNumber}</span>
                        <div className="text-xs text-[#5d5f5f]">{vehicle.name}</div>
                      </div>
                    ) : (
                      <span className="text-[#5d5f5f]">Unknown Vehicle</span>
                    )}
                  </td>
                  <td className="p-4 text-white">
                    <div className="flex items-center gap-2">
                      <Wrench size={14} className="text-[#5d5f5f]" />
                      {log.serviceType}
                    </div>
                    {log.notes && <div className="text-xs text-[#5d5f5f] mt-1">{log.notes}</div>}
                  </td>
                  <td className="p-4 font-mono">
                    {new Date(log.date).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-mono text-white">
                    ${log.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border ${
                      log.status === 'Active' ? 'bg-[#291e00] text-[#ffc633] border-[#7a5900]' :
                      'bg-[#262626] text-[#c4c7c8] border-[#404040]'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  {user?.role === 'FleetManager' && (
                    <td className="p-4 text-right">
                      {log.status === 'Active' && (
                        <button 
                          onClick={() => handleClose(log)}
                          className="p-1.5 text-[#8e9192] hover:text-[#48ddbc] hover:bg-[#002019] rounded transition-colors"
                          title="Close Record"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
            {filteredLogs.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#5d5f5f]">
                  <AlertTriangle className="mx-auto mb-2 text-[#5d5f5f]" size={24} />
                  No maintenance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <MaintenanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={(saved) => {
          setLogs(prev => [saved, ...prev]);
        }}
      />
    </div>
  );
}
