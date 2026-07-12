import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, AlertCircle } from 'lucide-react';
import { tripCompleteSchema, type TripCompleteValues } from '../../schemas/trip';
import type { Trip } from '../../types';
import { completeTrip } from '../../services/trips';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (trip: Trip) => void;
  trip: Trip | null;
}

export function TripCompleteModal({ isOpen, onClose, onSaved, trip }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TripCompleteValues>({
    resolver: zodResolver(tripCompleteSchema),
    defaultValues: {
      actualDistanceKm: 0,
      fuelConsumedLiters: 0,
    },
  });

  useEffect(() => {
    if (isOpen && trip) {
      reset({
        actualDistanceKm: trip.plannedDistanceKm || 0,
        fuelConsumedLiters: 0,
      });
    }
  }, [isOpen, trip, reset]);

  const onSubmit = async (data: TripCompleteValues) => {
    if (!trip) return;
    try {
      const savedTrip = await completeTrip(trip.id, data);
      onSaved(savedTrip);
      onClose();
    } catch (err: any) {
      setError('root', { message: err.message || 'Failed to complete trip' });
    }
  };

  if (!isOpen || !trip) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#1F1F1F] bg-[#050505]">
          <h2 className="text-lg font-bold text-white font-sans tracking-tight">Complete Trip {trip.tripCode}</h2>
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

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Actual Distance (km)</label>
              <input
                type="number"
                {...register('actualDistanceKm', { valueAsNumber: true })}
                className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white focus:outline-none focus:border-white text-sm font-mono"
              />
              {errors.actualDistanceKm && <p className="text-[#ffb4ab] text-xs">{errors.actualDistanceKm.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Fuel Consumed (Liters)</label>
              <input
                type="number"
                {...register('fuelConsumedLiters', { valueAsNumber: true })}
                className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white focus:outline-none focus:border-white text-sm font-mono"
              />
              {errors.fuelConsumedLiters && <p className="text-[#ffb4ab] text-xs">{errors.fuelConsumedLiters.message}</p>}
            </div>
          </div>

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
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-black bg-[#48ddbc] rounded hover:bg-[#3ec4a6] disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Complete Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
