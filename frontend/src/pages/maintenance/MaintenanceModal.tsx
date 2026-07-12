import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, AlertCircle } from 'lucide-react';
import { maintenanceCreateSchema, type MaintenanceCreateValues } from '../../schemas/maintenance';
import type { MaintenanceLog, Vehicle } from '../../types';
import { createMaintenanceLog } from '../../services/maintenance';
import { getVehicles } from '../../services/vehicles';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (log: MaintenanceLog) => void;
}

export function MaintenanceModal({ isOpen, onClose, onSaved }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MaintenanceCreateValues>({
    resolver: zodResolver(maintenanceCreateSchema),
    defaultValues: {
      vehicleId: '',
      serviceType: '',
      cost: 0,
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        vehicleId: '',
        serviceType: '',
        cost: 0,
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });

      const fetchAssets = async () => {
        setLoadingAssets(true);
        try {
          const vRes = await getVehicles();
          setVehicles(vRes);
        } catch (err) {
          console.error("Failed to load assets", err);
        } finally {
          setLoadingAssets(false);
        }
      };
      fetchAssets();
    }
  }, [isOpen, reset]);

  // Exclude retired vehicles
  const availableVehicles = vehicles.filter(v => v.status !== 'Retired');

  const onSubmit = async (data: MaintenanceCreateValues) => {
    try {
      const isoDate = new Date(data.date).toISOString();
      const payload = { ...data, date: isoDate };
      const savedLog = await createMaintenanceLog(payload);
      onSaved(savedLog);
      onClose();
    } catch (err: any) {
      setError('root', { message: err.message || 'Failed to create maintenance log' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#1F1F1F] bg-[#050505]">
          <h2 className="text-lg font-bold text-white font-sans tracking-tight">Create Maintenance Record</h2>
          <button onClick={onClose} className="text-[#5d5f5f] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {errors.root && (
            <div className="p-3 text-sm text-[#ffb4ab] bg-[#1f1111] border border-[#4a1c1c] rounded flex items-center gap-2">
              <AlertCircle size={16} /> {errors.root.message}
            </div>
          )}

          {loadingAssets ? (
            <div className="py-8 text-center text-[#5d5f5f] animate-pulse">Loading vehicles...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Vehicle</label>
                <select
                  {...register('vehicleId')}
                  className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white focus:outline-none focus:border-white text-sm appearance-none"
                >
                  <option value="">Select a vehicle...</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.registrationNumber} - {v.name} ({v.type})</option>
                  ))}
                </select>
                {errors.vehicleId && <p className="text-[#ffb4ab] text-xs">{errors.vehicleId.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Service Type</label>
                <input
                  {...register('serviceType')}
                  className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white placeholder-[#5d5f5f] focus:outline-none focus:border-white text-sm"
                  placeholder="e.g. Oil Change"
                />
                {errors.serviceType && <p className="text-[#ffb4ab] text-xs">{errors.serviceType.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Cost ($)</label>
                <input
                  type="number"
                  {...register('cost', { valueAsNumber: true })}
                  className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white focus:outline-none focus:border-white text-sm font-mono"
                />
                {errors.cost && <p className="text-[#ffb4ab] text-xs">{errors.cost.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Date</label>
                <input
                  type="date"
                  {...register('date')}
                  className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white focus:outline-none focus:border-white text-sm font-mono [color-scheme:dark]"
                />
                {errors.date && <p className="text-[#ffb4ab] text-xs">{errors.date.message}</p>}
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Notes (Optional)</label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white placeholder-[#5d5f5f] focus:outline-none focus:border-white text-sm"
                  placeholder="Additional details..."
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[#1F1F1F]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white border border-[#262626] rounded bg-transparent hover:bg-[#131313] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loadingAssets}
              className="px-4 py-2 text-sm font-medium text-black bg-white rounded hover:bg-[#e5e2e1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
