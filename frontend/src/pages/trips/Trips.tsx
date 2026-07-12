import { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle, XCircle, Send, AlertTriangle } from 'lucide-react';
import { getTrips, dispatchTrip, cancelTrip, getTripsSummary } from '../../services/trips.ts';
import type { SummaryData } from '../../services/vehicles.ts';
import type { Trip } from '../../types';
import { LoadingBuffer } from '../../components/ui/Loading.tsx';
import { SummaryCard } from '../../components/ui/SummaryCard.tsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TripCreateModal } from './TripCreateModal.tsx';
import { TripCompleteModal } from './TripCompleteModal.tsx';
import { useAuthStore } from '../../store/authStore';

export default function Trips() {
  const { user } = useAuthStore();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [period, setPeriod] = useState('monthly');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [completeTripTarget, setCompleteTripTarget] = useState<Trip | null>(null);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const filters = { search, status: statusFilter, period };
      const [tData, sData] = await Promise.all([getTrips(filters), getTripsSummary(filters)]);
      setTrips(tData);
      setSummary(sData);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [search, statusFilter, period]);

  const handleDispatch = async (trip: Trip) => {
    if (window.confirm(`Are you sure you want to dispatch trip ${trip.tripCode}?`)) {
      try {
        await dispatchTrip(trip.id);
        fetchTrips();
      } catch (err: any) {
        alert(err.message || 'Failed to dispatch trip');
      }
    }
  };

  const handleCancel = async (trip: Trip) => {
    if (window.confirm(`Are you sure you want to cancel trip ${trip.tripCode}?`)) {
      try {
        await cancelTrip(trip.id);
        fetchTrips();
      } catch (err: any) {
        alert(err.message || 'Failed to cancel trip');
      }
    }
  };

  if (error) throw error;
  if (loading && !trips.length) return <LoadingBuffer message="Loading Trip Management..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold tracking-tight text-white font-sans">Trip Management</h2>
        {user?.role === 'Dispatcher' && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-[#e5e2e1] transition-colors"
          >
            <Plus size={16} /> Create Trip
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-[#0A0A0A] p-4 rounded-lg border border-[#1F1F1F]">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5d5f5f]" />
          <input
            type="text"
            placeholder="Search by Code, Source, or Destination..."
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
          <option value="Draft">Draft</option>
          <option value="Dispatched">Dispatched</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
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
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#c4c7c8]">Trip Volume</h3>
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
                    <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#48ddbc" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#48ddbc" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                  <XAxis dataKey="name" stroke="#5d5f5f" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis stroke="#5d5f5f" tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#131313', border: '1px solid #262626', borderRadius: '4px' }} />
                  <Area type="monotone" dataKey="value" stroke="#48ddbc" strokeWidth={3} fillOpacity={1} fill="url(#colorTrips)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="lg:col-span-1">
            <SummaryCard title="Trips Summary" stats={summary.stats.map(s => ({ label: s.label, value: s.value, color: s.color }))} />
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
              <th className="p-4">Trip Code</th>
              <th className="p-4">Route</th>
              <th className="p-4">Cargo / Dist</th>
              <th className="p-4">Lifecycle</th>
              {user?.role === 'Dispatcher' && <th className="p-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F1F1F]">
            {trips.map(trip => {
              const tripAny = trip as any;
              const statusStr = trip.status as string;
              return (
              <tr key={trip.id} className="hover:bg-[#131313] transition-colors">
                <td className="p-4 font-mono text-white font-medium">{trip.tripCode || tripAny.tripNumber || trip.id.substring(0,6)}</td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-white truncate max-w-[150px]" title={trip.source}>{trip.source}</span>
                    <span className="text-[#5d5f5f] text-xs">to</span>
                    <span className="text-white truncate max-w-[150px]" title={trip.destination}>{trip.destination}</span>
                  </div>
                </td>
                <td className="p-4 font-mono">
                  <div>{trip.cargoWeightKg || tripAny.cargoWeight || 0} kg</div>
                  <div className="text-[#5d5f5f] text-xs">{trip.plannedDistanceKm || tripAny.plannedDistance || 0} km</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border ${
                    statusStr === 'Draft' || statusStr === 'DRAFT' ? 'bg-[#262626] text-[#c4c7c8] border-[#404040]' :
                    statusStr === 'Dispatched' || statusStr === 'DISPATCHED' ? 'bg-[#00173b] text-[#558ded] border-[#00388d]' :
                    statusStr === 'Completed' || statusStr === 'COMPLETED' ? 'bg-[#002019] text-[#48ddbc] border-[#005142]' :
                    'bg-[#1f1111] text-[#ffb4ab] border-[#4a1c1c]'
                  }`}>
                    {statusStr}
                  </span>
                  
                  <div className="mt-2 text-[10px] text-[#5d5f5f]">
                    {new Date(trip.createdAt).toLocaleDateString()}
                  </div>
                </td>
                {user?.role === 'Dispatcher' && (
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    {(statusStr === 'Draft' || statusStr === 'DRAFT') && (
                      <button 
                        onClick={() => handleDispatch(trip)}
                        className="p-1.5 text-[#8e9192] hover:text-[#558ded] hover:bg-[#00173b] rounded transition-colors"
                        title="Dispatch"
                      >
                        <Send size={16} />
                      </button>
                    )}
                    {(statusStr === 'Dispatched' || statusStr === 'DISPATCHED') && (
                      <>
                        <button 
                          onClick={() => setCompleteTripTarget(trip)}
                          className="p-1.5 text-[#8e9192] hover:text-[#48ddbc] hover:bg-[#002019] rounded transition-colors"
                          title="Complete Trip"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          onClick={() => handleCancel(trip)}
                          className="p-1.5 text-[#8e9192] hover:text-[#ffb4ab] hover:bg-[#1f1111] rounded transition-colors"
                          title="Cancel Trip"
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            )})}
            {trips.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[#5d5f5f]">
                  <AlertTriangle className="mx-auto mb-2 text-[#5d5f5f]" size={24} />
                  No trips found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TripCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSaved={(saved) => {
          setTrips(prev => [saved, ...prev]);
        }}
      />

      <TripCompleteModal
        isOpen={!!completeTripTarget}
        onClose={() => setCompleteTripTarget(null)}
        trip={completeTripTarget}
        onSaved={(saved) => {
          setTrips(prev => prev.map(t => t.id === saved.id ? saved : t));
        }}
      />
    </div>
  );
}
