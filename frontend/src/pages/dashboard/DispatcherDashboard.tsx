import { useEffect, useState } from 'react';
import { 
  getActiveTrips, getAvailableVehicles, getAvailableDrivers, 
  getDispatchSuggestions, getRecentDispatchActivity,
  type DispatcherVehicle, type DispatcherDriver, type DispatchSuggestion, type ActivityFeedItem
} from '../../services/dashboard';
import { LoadingBuffer } from '../../components/ui/Loading';
import { MapPin, User, Navigation, Truck, Zap, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DispatcherDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [activeTrips, setActiveTrips] = useState<any[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<DispatcherVehicle[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<DispatcherDriver[]>([]);
  const [suggestions, setSuggestions] = useState<DispatchSuggestion[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityFeedItem[]>([]);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getActiveTrips(), getAvailableVehicles(), getAvailableDrivers(),
      getDispatchSuggestions(), getRecentDispatchActivity()
    ]).then(results => {
      if (mounted) {
        setActiveTrips(results[0]);
        setAvailableVehicles(results[1]);
        setAvailableDrivers(results[2]);
        setSuggestions(results[3]);
        setRecentActivity(results[4]);
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
  if (loading) return <LoadingBuffer message="Loading Dispatch Data..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-white font-sans">Dispatch Command Center</h2>
      </div>

      {/* ROW 1: Active Trips & Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1F1F1F]">
            <div className="flex items-center gap-3">
              <Navigation size={20} className="text-[#48ddbc]" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Active Trips</h3>
            </div>
            <Link to="/trips" className="text-xs text-[#5d5f5f] hover:text-white uppercase font-bold tracking-wider">View All</Link>
          </div>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-hide pr-2">
            {activeTrips.map(trip => (
              <div key={trip.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#131313] rounded border border-[#262626] hover:border-[#404040] transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white font-mono">{trip.code}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#1c1b1b] text-[#c4c7c8] border border-[#353534]">
                      {trip.status}
                    </span>
                  </div>
                  <div className="text-xs text-[#8e9192] flex items-center gap-2">
                    <MapPin size={12} />
                    {trip.destination}
                  </div>
                </div>
                <div className="mt-2 sm:mt-0 text-left sm:text-right">
                  <div className="text-sm text-[#e5e2e1]">{trip.driver}</div>
                  <div className="text-xs text-[#8e9192] font-mono">{trip.vehicle}</div>
                </div>
              </div>
            ))}
            {activeTrips.length === 0 && (
              <div className="text-sm text-[#8e9192] text-center py-4">No active trips currently.</div>
            )}
          </div>
        </div>

        <div className="bg-[#1f1a0b] border border-[#4a3f1c] rounded-lg p-5">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#4a3f1c]">
            <Zap size={20} className="text-[#ffc633]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#ffc633]">Dispatch Suggestions</h3>
          </div>
          <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-hide">
            {suggestions.map(s => (
              <div key={s.id} className="p-3 bg-[#2a230f] border border-[#4a3f1c] rounded-md">
                <p className="text-sm font-bold text-white mb-1">{s.tripCode}</p>
                <p className="text-xs text-[#c4c7c8] mb-2">{s.reason}</p>
                <div className="flex items-center gap-2 text-xs font-mono text-[#ffc633]">
                  <span>V: {s.recommendedVehicleId}</span>
                  <span>|</span>
                  <span>D: {s.recommendedDriverId}</span>
                </div>
              </div>
            ))}
            {suggestions.length === 0 && (
              <div className="text-sm text-[#8e9192] text-center py-4">No smart suggestions available.</div>
            )}
          </div>
        </div>
      </div>

      {/* ROW 2: Resources & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Available Vehicles Widget */}
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-5">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1F1F1F]">
            <div className="flex items-center gap-3">
              <Truck size={20} className="text-white" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Available Vehicles</h3>
            </div>
            <Link to="/vehicles" className="text-xs text-[#5d5f5f] hover:text-white uppercase font-bold tracking-wider">View All</Link>
          </div>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-hide pr-2">
            {availableVehicles.map(vehicle => (
              <div key={vehicle.id} className="flex flex-col p-3 bg-[#131313] rounded border border-[#262626]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#e5e2e1] font-bold font-mono">{vehicle.registrationNumber}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase text-[#48ddbc] bg-[#002019] border border-[#005142]">
                    {vehicle.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#8e9192]">
                  <span>Cap: {vehicle.capacity}kg</span>
                  <span>{vehicle.region}</span>
                </div>
              </div>
            ))}
            {availableVehicles.length === 0 && (
              <div className="text-sm text-[#8e9192] text-center py-4">No available vehicles.</div>
            )}
          </div>
        </div>

        {/* Available Drivers Widget */}
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-5">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1F1F1F]">
            <div className="flex items-center gap-3">
              <User size={20} className="text-white" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Drivers Ready</h3>
            </div>
            <Link to="/drivers" className="text-xs text-[#5d5f5f] hover:text-white uppercase font-bold tracking-wider">View All</Link>
          </div>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-hide pr-2">
            {availableDrivers.map(driver => (
              <div key={driver.id} className="flex items-center justify-between p-3 bg-[#131313] rounded border border-[#262626]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#201f1f] border border-[#353534] flex items-center justify-center text-xs font-bold text-white uppercase">
                    {driver.name.charAt(0)}
                  </div>
                  <span className="text-sm text-[#e5e2e1] font-medium">{driver.name}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase text-[#48ddbc] bg-[#002019] border border-[#005142]">
                  {driver.status}
                </span>
              </div>
            ))}
            {availableDrivers.length === 0 && (
              <div className="text-sm text-[#8e9192] text-center py-4">No available drivers.</div>
            )}
          </div>
        </div>

        {/* Recent Dispatch Activity Widget */}
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-5">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#1F1F1F]">
            <Activity size={20} className="text-[#558ded]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Recent Activity</h3>
          </div>
          <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-hide pr-2">
            {recentActivity.map(activity => (
              <div key={activity.id} className="p-3 bg-[#131313] border border-[#1F1F1F] rounded-md">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-white uppercase">{activity.type}</p>
                  <span className="text-[10px] text-[#5d5f5f] font-mono">
                    {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-[#8e9192] leading-relaxed">{activity.description}</p>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-sm text-[#8e9192] text-center py-4">No recent activity.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
