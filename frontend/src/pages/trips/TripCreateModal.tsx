import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, AlertCircle } from 'lucide-react';
import { tripCreateSchema, type TripCreateValues } from '../../schemas/trip';
import type { Trip, Vehicle, Driver } from '../../types';
import { createTrip } from '../../services/trips';
import { getVehicles } from '../../services/vehicles';
import { getDrivers } from '../../services/drivers';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (trip: Trip) => void;
}

export function TripCreateModal({ isOpen, onClose, onSaved }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TripCreateValues>({
    resolver: zodResolver(tripCreateSchema),
    defaultValues: {
      source: '',
      destination: '',
      vehicleId: '',
      driverId: '',
      cargoWeightKg: 0,
      plannedDistanceKm: 0,
    },
  });

  const selectedVehicleId = watch('vehicleId');
  const cargoWeight = watch('cargoWeightKg');

  useEffect(() => {
    if (isOpen) {
      reset({
        source: '',
        destination: '',
        vehicleId: '',
        driverId: '',
        cargoWeightKg: 0,
        plannedDistanceKm: 0,
      });

      const fetchAssets = async () => {
        setLoadingAssets(true);
        try {
          const [vRes, dRes] = await Promise.all([getVehicles(), getDrivers()]);
          setVehicles(vRes);
          setDrivers(dRes);
        } catch (err) {
          console.error("Failed to load assets", err);
        } finally {
          setLoadingAssets(false);
        }
      };
      fetchAssets();
    }
  }, [isOpen, reset]);

  // Filter out unavailable assets
  // Vehicles excludes Retired, In Shop, On Trip
  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  // Drivers excludes Suspended, On Trip, Off Duty, and expired licenses
  const availableDrivers = drivers.filter(d => {
    if (d.status !== 'Available') return false;
    const expiry = new Date(d.licenseExpiryDate);
    const now = new Date();
    return expiry >= now; // must not be expired
  });

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
  const isOverweight = selectedVehicle && cargoWeight > selectedVehicle.maxLoadCapacityKg;

  const onSubmit = async (data: TripCreateValues) => {
    if (isOverweight) {
      setError('cargoWeightKg', {
        type: 'manual',
        message: `Exceeds max capacity of ${selectedVehicle.maxLoadCapacityKg}kg for this vehicle.`,
      });
      return;
    }

    try {
      const savedTrip = await createTrip(data);
      onSaved(savedTrip);
      onClose();
    } catch (err: any) {
      setError('root', { message: err.message || 'Failed to create trip' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#1F1F1F] bg-[#050505]">
          <h2 className="text-lg font-bold text-white font-sans tracking-tight">Create New Trip (Draft)</h2>
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
            <div className="py-8 text-center text-[#5d5f5f] animate-pulse">Loading available vehicles and drivers...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Source</label>
                <input
                  {...register('source')}
                  className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white placeholder-[#5d5f5f] focus:outline-none focus:border-white text-sm"
                  placeholder="Warehouse A"
                />
                {errors.source && <p className="text-[#ffb4ab] text-xs">{errors.source.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Destination</label>
                <input
                  {...register('destination')}
                  className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white placeholder-[#5d5f5f] focus:outline-none focus:border-white text-sm"
                  placeholder="Store 1"
                />
                {errors.destination && <p className="text-[#ffb4ab] text-xs">{errors.destination.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Assign Vehicle</label>
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
                <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Assign Driver</label>
                <select
                  {...register('driverId')}
                  className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white focus:outline-none focus:border-white text-sm appearance-none"
                >
                  <option value="">Select a driver...</option>
                  {availableDrivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.licenseNumber})</option>
                  ))}
                </select>
                {errors.driverId && <p className="text-[#ffb4ab] text-xs">{errors.driverId.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Cargo Weight (kg)</label>
                <input
                  type="number"
                  {...register('cargoWeightKg', { valueAsNumber: true })}
                  className={`w-full px-3 py-2 bg-[#050505] border ${isOverweight ? 'border-[#ffb4ab] text-[#ffb4ab]' : 'border-[#1F1F1F] text-white'} rounded focus:outline-none focus:border-white text-sm font-mono`}
                />
                {errors.cargoWeightKg && <p className="text-[#ffb4ab] text-xs">{errors.cargoWeightKg.message}</p>}
                {isOverweight && !errors.cargoWeightKg && (
                  <p className="text-[#ffb4ab] text-xs font-medium">Exceeds {selectedVehicle?.name}'s capacity ({selectedVehicle?.maxLoadCapacityKg}kg)</p>
                )}
                {!isOverweight && selectedVehicle && (
                  <p className="text-[#5d5f5f] text-xs">Capacity: {selectedVehicle.maxLoadCapacityKg}kg</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Planned Distance (km)</label>
                <input
                  type="number"
                  {...register('plannedDistanceKm', { valueAsNumber: true })}
                  className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white focus:outline-none focus:border-white text-sm font-mono"
                />
                {errors.plannedDistanceKm && <p className="text-[#ffb4ab] text-xs">{errors.plannedDistanceKm.message}</p>}
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
              disabled={isSubmitting || loadingAssets || isOverweight}
              className="px-4 py-2 text-sm font-medium text-black bg-white rounded hover:bg-[#e5e2e1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
