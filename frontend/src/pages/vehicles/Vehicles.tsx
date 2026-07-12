import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit2, Archive, AlertTriangle } from 'lucide-react';
import { getVehicles, updateVehicle, getFleetSummary, type SummaryData } from '../../services/vehicles.ts';
import type { Vehicle } from '../../types';
import { LoadingBuffer } from '../../components/ui/Loading.tsx';
import { SummaryCard } from '../../components/ui/SummaryCard.tsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { VehicleModal } from './VehicleModal.tsx';
import { useAuthStore } from '../../store/authStore';

export default function Vehicles() {
  const { user } = useAuthStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [period, setPeriod] = useState('monthly');
  const [sortField, setSortField] = useState<keyof Vehicle>('registrationNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>();

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const filters = { search, status: statusFilter, period };
      const [vData, sData] = await Promise.all([getVehicles(filters), getFleetSummary(filters)]);
      setVehicles(vData);
      setSummary(sData);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [search, statusFilter, period]);

  const handleSort = (field: keyof Vehicle) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleRetire = async (vehicle: Vehicle) => {
    if (window.confirm(`Are you sure you want to retire ${vehicle.registrationNumber}?`)) {
      try {
        const updated = await updateVehicle(vehicle.id, { status: 'Retired' });
        setVehicles(prev => prev.map(v => v.id === updated.id ? updated : v));
      } catch (err) {
        alert('Failed to retire vehicle');
      }
    }
  };

  const filteredAndSortedVehicles = useMemo(() => {
    return [...vehicles]
      .filter(v => {
        const matchesType = typeFilter === 'All' || v.type === typeFilter;
        return matchesType;
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
  }, [vehicles, typeFilter, sortField, sortOrder]);

  const canAddVehicle = user?.role === 'FleetManager';

  if (error) throw error;
  if (loading && !vehicles.length) return <LoadingBuffer message="Loading Registry..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold tracking-tight text-white font-sans">Vehicle Registry</h2>
        {canAddVehicle && (
          <button
            onClick={() => { setEditingVehicle(undefined); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-[#e5e2e1] transition-colors"
          >
            <Plus size={16} /> Add Vehicle
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-[#0A0A0A] p-4 rounded-lg border border-[#1F1F1F]">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5d5f5f]" />
          <input
            type="text"
            placeholder="Search by Reg No or Name..."
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
          <option value="In Shop">In Shop</option>
          <option value="Retired">Retired</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white text-sm focus:outline-none focus:border-white"
        >
          <option value="All">All Types</option>
          <option value="Van">Van</option>
          <option value="Truck">Truck</option>
          <option value="Mini">Mini</option>
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
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#c4c7c8]">Fleet Activity</h3>
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
                    <linearGradient id="colorFleet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#48ddbc" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#48ddbc" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                  <XAxis dataKey="name" stroke="#5d5f5f" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis stroke="#5d5f5f" tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#131313', border: '1px solid #262626', borderRadius: '4px' }} />
                  <Area type="monotone" dataKey="value" stroke="#48ddbc" strokeWidth={3} fillOpacity={1} fill="url(#colorFleet)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="lg:col-span-1">
            <SummaryCard title="Fleet Summary" stats={summary.stats.map(s => ({ label: s.label, value: s.value, color: s.color }))} />
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
              <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('registrationNumber')}>Reg No</th>
              <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>Name/Model</th>
              <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('type')}>Type</th>
              <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('maxLoadCapacityKg')}>Capacity</th>
              <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('odometerKm')}>Odometer</th>
              <th className="p-4">Status</th>
              {canAddVehicle && <th className="p-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F1F1F]">
            {filteredAndSortedVehicles.map(vehicle => (
              <tr key={vehicle.id} className="hover:bg-[#131313] transition-colors">
                <td className="p-4 font-mono text-white font-medium">{vehicle.registrationNumber}</td>
                <td className="p-4 text-white">{vehicle.name}</td>
                <td className="p-4">{vehicle.type}</td>
                <td className="p-4 font-mono">{vehicle.maxLoadCapacityKg} kg</td>
                <td className="p-4 font-mono">{vehicle.odometerKm.toLocaleString()} km</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border ${
                    vehicle.status === 'Available' ? 'bg-[#002019] text-[#48ddbc] border-[#005142]' :
                    vehicle.status === 'On Trip' ? 'bg-[#00173b] text-[#558ded] border-[#00388d]' :
                    vehicle.status === 'In Shop' ? 'bg-[#291e00] text-[#ffc633] border-[#7a5900]' :
                    'bg-[#1f1111] text-[#ffb4ab] border-[#4a1c1c]'
                  }`}>
                    {vehicle.status}
                  </span>
                </td>
                {canAddVehicle && (
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => { setEditingVehicle(vehicle); setIsModalOpen(true); }}
                      className="p-1.5 text-[#8e9192] hover:text-white hover:bg-[#262626] rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    {vehicle.status !== 'Retired' && (
                      <button 
                        onClick={() => handleRetire(vehicle)}
                        className="p-1.5 text-[#8e9192] hover:text-[#ffb4ab] hover:bg-[#1f1111] rounded transition-colors"
                        title="Retire"
                      >
                        <Archive size={16} />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {filteredAndSortedVehicles.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#5d5f5f]">
                  <AlertTriangle className="mx-auto mb-2 text-[#5d5f5f]" size={24} />
                  No vehicles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vehicle={editingVehicle}
        existingVehicles={vehicles}
        onSaved={(saved) => {
          setVehicles(prev => {
            const exists = prev.some(v => v.id === saved.id);
            if (exists) {
              return prev.map(v => v.id === saved.id ? saved : v);
            }
            return [...prev, saved];
          });
        }}
      />
    </div>
  );
}
