import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit2, UserX, AlertTriangle, ShieldAlert, ShieldCheck, Shield, Mail } from 'lucide-react';
import { getDrivers, updateDriver, getDriversSummary } from '../../services/drivers.ts';
import type { SummaryData } from '../../services/vehicles.ts';
import type { Driver } from '../../types';
import { LoadingBuffer } from '../../components/ui/Loading.tsx';
import { SummaryCard } from '../../components/ui/SummaryCard.tsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DriverModal } from './DriverModal.tsx';
import { useAuthStore } from '../../store/authStore';

// Helper to determine expiry status
const getExpiryStatus = (expiryDateStr: string) => {
  const expiry = new Date(expiryDateStr);
  const now = new Date();
  
  // Calculate difference in days
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  if (diffDays <= 30) return 'soon';
  return 'valid';
};

export default function Drivers() {
  const { user } = useAuthStore();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [period, setPeriod] = useState('monthly');
  const [sortField, setSortField] = useState<keyof Driver>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | undefined>();
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const filters = { search, status: statusFilter, period };
      const [dData, sData] = await Promise.all([getDrivers(filters), getDriversSummary(filters)]);
      setDrivers(dData);
      setSummary(sData);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [search, statusFilter, period]);

  const handleSort = (field: keyof Driver) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSuspend = async (driver: Driver) => {
    if (window.confirm(`Are you sure you want to suspend driver ${driver.name}?`)) {
      try {
        const updated = await updateDriver(driver.id, { status: 'Suspended' });
        setDrivers(prev => prev.map(d => d.id === updated.id ? updated : d));
      } catch (err) {
        alert('Failed to suspend driver');
      }
    }
  };

  const handleSendReminder = async (driverId: string) => {
    setSendingReminder(driverId);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSendingReminder(null);
    alert('Reminder sent successfully!');
  };

  const filteredAndSortedDrivers = useMemo(() => {
    return [...drivers]
      .filter(d => {
        const matchesCategory = categoryFilter === 'All' || d.licenseCategory === categoryFilter;
        return matchesCategory;
      })
      .sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
  }, [drivers, categoryFilter, sortField, sortOrder]);

  if (error) throw error;
  if (loading && !drivers.length) return <LoadingBuffer message="Loading Driver Management..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold tracking-tight text-white font-sans">Driver Management</h2>
        {(user?.role === 'FleetManager' || user?.role === 'SafetyOfficer') && (
          <button
            onClick={() => { setEditingDriver(undefined); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-[#e5e2e1] transition-colors"
          >
            <Plus size={16} /> Add Driver
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-[#0A0A0A] p-4 rounded-lg border border-[#1F1F1F]">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5d5f5f]" />
          <input
            type="text"
            placeholder="Search by Name or License No..."
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
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="Off Duty">Off Duty</option>
          <option value="Suspended">Suspended</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white text-sm focus:outline-none focus:border-white"
        >
          <option value="All">All Categories</option>
          <option value="LMV">LMV</option>
          <option value="HMV">HMV</option>
          <option value="MCWG">MCWG</option>
        </select>
      </div>

      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
          {loading && (
            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center rounded-lg backdrop-blur-sm">
              <div className="w-8 h-8 border-4 border-[#48ddbc] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-5 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#c4c7c8]">Driver Activity</h3>
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
                    <linearGradient id="colorDrivers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#558ded" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#558ded" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                  <XAxis dataKey="name" stroke="#5d5f5f" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis stroke="#5d5f5f" tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#131313', border: '1px solid #262626', borderRadius: '4px' }} />
                  <Area type="monotone" dataKey="value" stroke="#558ded" strokeWidth={3} fillOpacity={1} fill="url(#colorDrivers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="lg:col-span-1">
            <SummaryCard title="Driver Summary" stats={summary.stats.map(s => ({ label: s.label, value: s.value, color: s.color }))} />
          </div>
        </div>
      )}

      <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg overflow-x-auto relative">
        {loading && (
          <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center backdrop-blur-sm">
            <div className="w-8 h-8 border-4 border-[#48ddbc] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <table className="w-full text-left text-sm text-[#c4c7c8]">
          <thead className="bg-[#131313] border-b border-[#1F1F1F] text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>Name</th>
              <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('licenseNumber')}>License No</th>
              <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('licenseCategory')}>Category</th>
              <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('licenseExpiryDate')}>Expiry Date</th>
              <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('safetyScore')}>Safety Score</th>
              <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('status')}>Status</th>
              {(user?.role === 'FleetManager' || user?.role === 'SafetyOfficer') && <th className="p-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F1F1F]">
            {filteredAndSortedDrivers.map(driver => {
              const expiryStatus = getExpiryStatus(driver.licenseExpiryDate);
              const formattedDate = new Date(driver.licenseExpiryDate).toLocaleDateString();
              
              return (
                <tr key={driver.id} className="hover:bg-[#131313] transition-colors">
                  <td className="p-4 text-white font-medium">{driver.name}</td>
                  <td className="p-4 font-mono text-white">{driver.licenseNumber}</td>
                  <td className="p-4">{driver.licenseCategory}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{formattedDate}</span>
                      {expiryStatus === 'expired' && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#ffb4ab] bg-[#1f1111] border border-[#4a1c1c] px-2 py-0.5 rounded tracking-wide uppercase">
                          <ShieldAlert size={12} /> Expired
                        </span>
                      )}
                      {expiryStatus === 'soon' && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#ffc633] bg-[#291e00] border border-[#7a5900] px-2 py-0.5 rounded tracking-wide uppercase">
                          <AlertTriangle size={12} /> Expiring Soon
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{driver.safetyScore}</span>
                      {driver.safetyScore >= 90 ? <ShieldCheck size={14} className="text-[#48ddbc]" /> :
                       driver.safetyScore >= 70 ? <Shield size={14} className="text-[#ffc633]" /> :
                       <ShieldAlert size={14} className="text-[#ffb4ab]" />}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border ${
                      driver.status === 'Available' ? 'bg-[#002019] text-[#48ddbc] border-[#005142]' :
                      driver.status === 'On Trip' ? 'bg-[#00173b] text-[#558ded] border-[#00388d]' :
                      driver.status === 'Off Duty' ? 'bg-[#262626] text-[#c4c7c8] border-[#404040]' :
                      'bg-[#1f1111] text-[#ffb4ab] border-[#4a1c1c]'
                    }`}>
                      {driver.status}
                    </span>
                  </td>
                  {(user?.role === 'FleetManager' || user?.role === 'SafetyOfficer') && (
                    <td className="p-4 text-right space-x-2">
                      {(expiryStatus === 'expired' || expiryStatus === 'soon') && (
                        <button 
                          onClick={() => handleSendReminder(driver.id)}
                          disabled={sendingReminder === driver.id}
                          className="p-1.5 text-[#8e9192] hover:text-[#ffc633] hover:bg-[#291e00] rounded transition-colors disabled:opacity-50"
                          title="Send Expiry Reminder"
                        >
                          <Mail size={16} className={sendingReminder === driver.id ? 'animate-pulse' : ''} />
                        </button>
                      )}
                      <button 
                        onClick={() => { setEditingDriver(driver); setIsModalOpen(true); }}
                        className="p-1.5 text-[#8e9192] hover:text-white hover:bg-[#262626] rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      {driver.status !== 'Suspended' && (
                        <button 
                          onClick={() => handleSuspend(driver)}
                          className="p-1.5 text-[#8e9192] hover:text-[#ffb4ab] hover:bg-[#1f1111] rounded transition-colors"
                          title="Suspend"
                        >
                          <UserX size={16} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
            {filteredAndSortedDrivers.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#5d5f5f]">
                  <AlertTriangle className="mx-auto mb-2 text-[#5d5f5f]" size={24} />
                  No drivers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DriverModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        driver={editingDriver}
        existingDrivers={drivers}
        onSaved={(saved) => {
          setDrivers(prev => {
            const exists = prev.some(d => d.id === saved.id);
            if (exists) {
              return prev.map(d => d.id === saved.id ? saved : d);
            }
            return [...prev, saved];
          });
        }}
      />
    </div>
  );
}
