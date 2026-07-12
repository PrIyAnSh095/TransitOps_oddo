import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, AlertCircle } from 'lucide-react';
import { fuelLogSchema, type FuelLogCreateValues } from '../../schemas/expense';
import type { FuelLog, Vehicle, Trip } from '../../types';
import { createFuelLog } from '../../services/expenses';
import { getVehicles } from '../../services/vehicles';
import { getTrips } from '../../services/trips';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (log: FuelLog) => void;
}

export function FuelLogModal({ isOpen, onClose, onSaved }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FuelLogCreateValues>({
    resolver: zodResolver(fuelLogSchema),
    defaultValues: {
      vehicleId: '',
      tripId: '',
      liters: 0,
      cost: 0,
      date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        vehicleId: '',
        tripId: '',
        liters: 0,
        cost: 0,
        date: new Date().toISOString().split('T')[0],
      });

      const fetchAssets = async () => {
        setLoadingAssets(true);
        try {
          const [vRes, tRes] = await Promise.all([getVehicles(), getTrips()]);
          setVehicles(vRes);
          // Only show active trips (DRAFT or DISPATCHED)
          setTrips(tRes.filter(t => t.status === 'Draft' || t.status === 'Dispatched'));
        } catch (err) {
          console.error('Failed to load assets', err);
        } finally {
          setLoadingAssets(false);
        }
      };
      fetchAssets();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: FuelLogCreateValues) => {
    try {
      const isoDate = new Date(data.date).toISOString();
      const payload = { ...data, date: isoDate };
      // Remove empty optional tripId so backend doesn't try to cast empty string
      if (!payload.tripId) delete payload.tripId;

      const savedLog = await createFuelLog(payload);
      onSaved(savedLog);
      onClose();
    } catch (err: any) {
      setError('root', { message: err.message || 'Failed to create fuel log' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#1F1F1F] bg-[#050505]">
          <h2 className="text-lg font-bold text-white font-sans tracking-tight">Add Fuel Log</h2>
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
            <div className="py-8 text-center text-[#5d5f5f] animate-pulse">Loading data...</div>
          ) : (
            <div className="space-y-4">

              {/* Vehicle dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Vehicle</label>
                <select
                  {...register('vehicleId')}
                  className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white focus:outline-none focus:border-white text-sm appearance-none"
                >
                  <option value="">Select a vehicle...</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.registrationNumber} — {v.name}</option>
                  ))}
                </select>
                {errors.vehicleId && <p className="text-[#ffb4ab] text-xs">{errors.vehicleId.message}</p>}
              </div>

              {/* Trip dropdown (optional) — uses real MongoDB _id as value */}
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">
                  Trip <span className="text-[#5d5f5f] normal-case font-normal">(Optional)</span>
                </label>
                <select
                  {...register('tripId')}
                  className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white focus:outline-none focus:border-white text-sm appearance-none"
                >
                  <option value="">None — not linked to a trip</option>
                  {trips.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.tripCode} · {t.source} → {t.destination}
                    </option>
                  ))}
                </select>
              </div>

              {/* Liters & Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Liters</label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('liters', { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white focus:outline-none focus:border-white text-sm font-mono"
                  />
                  {errors.liters && <p className="text-[#ffb4ab] text-xs">{errors.liters.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Total Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('cost', { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white focus:outline-none focus:border-white text-sm font-mono"
                  />
                  {errors.cost && <p className="text-[#ffb4ab] text-xs">{errors.cost.message}</p>}
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Date</label>
                <input
                  type="date"
                  {...register('date')}
                  className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white focus:outline-none focus:border-white text-sm font-mono [color-scheme:dark]"
                />
                {errors.date && <p className="text-[#ffb4ab] text-xs">{errors.date.message}</p>}
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
              {isSubmitting ? 'Saving...' : 'Save Fuel Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
