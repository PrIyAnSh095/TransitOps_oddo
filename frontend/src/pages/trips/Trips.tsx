import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, CheckCircle, XCircle, Send, AlertTriangle } from 'lucide-react';
import { getTrips, dispatchTrip, cancelTrip } from '../../services/trips.ts';
import type { Trip } from '../../types';
import { LoadingBuffer } from '../../components/ui/Loading.tsx';
import { TripCreateModal } from './TripCreateModal.tsx';
import { TripCompleteModal } from './TripCompleteModal.tsx';

export default function Trips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [completeTripTarget, setCompleteTripTarget] = useState<Trip | null>(null);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const data = await getTrips();
      setTrips(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDispatch = async (trip: Trip) => {
    if (window.confirm(`Are you sure you want to dispatch trip ${trip.tripCode}?`)) {
      try {
        const updated = await dispatchTrip(trip.id);
        setTrips(prev => prev.map(t => t.id === updated.id ? updated : t));
      } catch (err: any) {
        alert(err.message || 'Failed to dispatch trip');
      }
    }
  };

  const handleCancel = async (trip: Trip) => {
    if (window.confirm(`Are you sure you want to cancel trip ${trip.tripCode}?`)) {
      try {
        const updated = await cancelTrip(trip.id);
        setTrips(prev => prev.map(t => t.id === updated.id ? updated : t));
      } catch (err: any) {
        alert(err.message || 'Failed to cancel trip');
      }
    }
  };

  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      const matchesSearch = t.tripCode.toLowerCase().includes(search.toLowerCase()) || 
                            t.source.toLowerCase().includes(search.toLowerCase()) ||
                            t.destination.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [trips, search, statusFilter]);

  if (error) throw error;
  if (loading) return <LoadingBuffer message="Loading Trip Management..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold tracking-tight text-white font-sans">Trip Management</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-[#e5e2e1] transition-colors"
        >
          <Plus size={16} /> Create Trip
        </button>
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

      <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg overflow-x-auto">
        <table className="w-full text-left text-sm text-[#c4c7c8]">
          <thead className="bg-[#131313] border-b border-[#1F1F1F] text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4">Trip Code</th>
              <th className="p-4">Route</th>
              <th className="p-4">Cargo / Dist</th>
              <th className="p-4">Lifecycle</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F1F1F]">
            {filteredTrips.map(trip => (
              <tr key={trip.id} className="hover:bg-[#131313] transition-colors">
                <td className="p-4 font-mono text-white font-medium">{trip.tripCode}</td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-white truncate max-w-[150px]" title={trip.source}>{trip.source}</span>
                    <span className="text-[#5d5f5f] text-xs">to</span>
                    <span className="text-white truncate max-w-[150px]" title={trip.destination}>{trip.destination}</span>
                  </div>
                </td>
                <td className="p-4 font-mono">
                  <div>{trip.cargoWeightKg} kg</div>
                  <div className="text-[#5d5f5f] text-xs">{trip.plannedDistanceKm} km</div>
                </td>
                <td className="p-4">
                  {/* Status Pill matching Vehicle / Driver design */}
                  <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border ${
                    trip.status === 'Draft' ? 'bg-[#262626] text-[#c4c7c8] border-[#404040]' :
                    trip.status === 'Dispatched' ? 'bg-[#00173b] text-[#558ded] border-[#00388d]' :
                    trip.status === 'Completed' ? 'bg-[#002019] text-[#48ddbc] border-[#005142]' :
                    'bg-[#1f1111] text-[#ffb4ab] border-[#4a1c1c]'
                  }`}>
                    {trip.status}
                  </span>
                  
                  {/* Small sub-text date for lifecycle context */}
                  <div className="mt-2 text-[10px] text-[#5d5f5f]">
                    {trip.status === 'Draft' && `Created: ${new Date(trip.createdAt).toLocaleDateString()}`}
                    {trip.status === 'Dispatched' && trip.dispatchedAt && `Dispatched: ${new Date(trip.dispatchedAt).toLocaleDateString()}`}
                    {trip.status === 'Completed' && trip.completedAt && `Completed: ${new Date(trip.completedAt).toLocaleDateString()}`}
                    {trip.status === 'Cancelled' && trip.cancelledAt && `Cancelled: ${new Date(trip.cancelledAt).toLocaleDateString()}`}
                  </div>
                </td>
                <td className="p-4 text-right space-x-2 whitespace-nowrap">
                  {trip.status === 'Draft' && (
                    <button 
                      onClick={() => handleDispatch(trip)}
                      className="p-1.5 text-[#8e9192] hover:text-[#558ded] hover:bg-[#00173b] rounded transition-colors"
                      title="Dispatch"
                    >
                      <Send size={16} />
                    </button>
                  )}
                  {trip.status === 'Dispatched' && (
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
              </tr>
            ))}
            {filteredTrips.length === 0 && (
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
