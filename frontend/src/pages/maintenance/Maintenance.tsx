import { useState, useEffect, useMemo } from 'react';
import { Plus, CheckCircle, Wrench, AlertTriangle } from 'lucide-react';
import { getMaintenanceLogs, closeMaintenanceLog } from '../../services/maintenance.ts';
import { getVehicles } from '../../services/vehicles.ts';
import type { MaintenanceLog, Vehicle } from '../../types';
import { LoadingBuffer } from '../../components/ui/Loading.tsx';
import { MaintenanceModal } from './MaintenanceModal.tsx';

export default function Maintenance() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsData, vehiclesData] = await Promise.all([
        getMaintenanceLogs(),
        getVehicles()
      ]);
      setLogs(logsData);
      setVehicles(vehiclesData);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      return vehicleFilter === 'All' || l.vehicleId === vehicleFilter;
    });
  }, [logs, vehicleFilter]);

  if (error) throw error;
  if (loading) return <LoadingBuffer message="Loading Maintenance Records..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold tracking-tight text-white font-sans">Maintenance Management</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-[#e5e2e1] transition-colors"
        >
          <Plus size={16} /> New Record
        </button>
      </div>

      <div className="flex gap-4 bg-[#0A0A0A] p-4 rounded-lg border border-[#1F1F1F]">
        <div className="flex-1 flex items-center gap-4">
          <label className="text-sm text-[#c4c7c8] font-semibold uppercase tracking-wider hidden sm:block">Filter by Vehicle:</label>
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="flex-1 sm:max-w-xs px-4 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white text-sm focus:outline-none focus:border-white appearance-none"
          >
            <option value="All">All Vehicles</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.registrationNumber} ({v.name})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg overflow-x-auto">
        <table className="w-full text-left text-sm text-[#c4c7c8]">
          <thead className="bg-[#131313] border-b border-[#1F1F1F] text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4">Vehicle</th>
              <th className="p-4">Service Type</th>
              <th className="p-4">Date</th>
              <th className="p-4">Cost</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
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
                </tr>
              );
            })}
            {filteredLogs.length === 0 && (
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
