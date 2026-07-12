import { useEffect, useState } from 'react';
import { getDispatcherDashboard, type DispatcherResponse } from '../../services/dashboard';
import { LoadingBuffer } from '../../components/ui/Loading';
import { MapPin, User, Navigation } from 'lucide-react';

export function DispatcherDashboard() {
  const [data, setData] = useState<DispatcherResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    getDispatcherDashboard()
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
    return <LoadingBuffer message="Loading Dispatch Data..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-white font-sans">Dispatch Command Center</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Trips Widget */}
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-5">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#1F1F1F]">
            <Navigation size={20} className="text-white" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Active Trips</h3>
          </div>
          
          <div className="space-y-4">
            {data.activeTrips.map(trip => (
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
            {data.activeTrips.length === 0 && (
              <div className="text-sm text-[#8e9192] text-center py-4">No active trips currently.</div>
            )}
          </div>
        </div>

        {/* Available Drivers Widget */}
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-5">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#1F1F1F]">
            <User size={20} className="text-white" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Available Drivers</h3>
          </div>
          
          <div className="space-y-4">
            {data.availableDrivers.map(driver => (
              <div key={driver.id} className="flex items-center justify-between p-4 bg-[#131313] rounded border border-[#262626]">
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
            {data.availableDrivers.length === 0 && (
              <div className="text-sm text-[#8e9192] text-center py-4">No available drivers.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
