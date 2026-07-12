import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Upload, FileText } from 'lucide-react';
import { vehicleSchema, type VehicleFormValues } from '../../schemas/vehicle';
import type { Vehicle } from '../../types';
import { createVehicle, updateVehicle } from '../../services/vehicles';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (vehicle: Vehicle) => void;
  vehicle?: Vehicle;
  existingVehicles: Vehicle[];
}

export function VehicleModal({ isOpen, onClose, onSaved, vehicle, existingVehicles }: Props) {
  const [uploadedDocs, setUploadedDocs] = useState<{name: string, url: string}[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      registrationNumber: '',
      name: '',
      type: 'Van',
      maxLoadCapacityKg: 0,
      odometerKm: 0,
      acquisitionCost: 0,
      region: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      setUploadedDocs(vehicle?.documents || []);
      if (vehicle) {
        reset({
          registrationNumber: vehicle.registrationNumber,
          name: vehicle.name,
          type: vehicle.type,
          maxLoadCapacityKg: vehicle.maxLoadCapacityKg,
          odometerKm: vehicle.odometerKm,
          acquisitionCost: vehicle.acquisitionCost,
          region: vehicle.region,
        });
      } else {
        reset({
          registrationNumber: '',
          name: '',
          type: 'Van',
          maxLoadCapacityKg: 0,
          odometerKm: 0,
          acquisitionCost: 0,
          region: '',
        });
      }
    }
  }, [isOpen, vehicle, reset]);

  const onSubmit = async (data: VehicleFormValues) => {
    // Client-side uniqueness check
    const isDuplicate = existingVehicles.some(
      (v) => v.registrationNumber === data.registrationNumber && v.id !== vehicle?.id
    );

    if (isDuplicate) {
      setError('registrationNumber', {
        type: 'manual',
        message: 'This registration number already exists.',
      });
      return;
    }

    try {
      const payload = { ...data, documents: uploadedDocs };
      let savedVehicle: Vehicle;
      if (vehicle) {
        savedVehicle = await updateVehicle(vehicle.id, payload);
      } else {
        savedVehicle = await createVehicle(payload);
      }
      onSaved(savedVehicle);
      onClose();
    } catch (err: any) {
      setError('root', { message: err.message || 'Failed to save vehicle' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#1F1F1F] bg-[#050505]">
          <h2 className="text-lg font-bold text-white font-sans tracking-tight">
            {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
          <button onClick={onClose} className="text-[#5d5f5f] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {errors.root && (
            <div className="p-3 text-sm text-[#ffb4ab] bg-[#1f1111] border border-[#4a1c1c] rounded">
              {errors.root.message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Registration No.</label>
              <input
                {...register('registrationNumber')}
                className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white placeholder-[#5d5f5f] focus:outline-none focus:border-white text-sm font-mono uppercase"
                placeholder="AB123CD"
              />
              {errors.registrationNumber && <p className="text-[#ffb4ab] text-xs">{errors.registrationNumber.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Name / Model</label>
              <input
                {...register('name')}
                className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white placeholder-[#5d5f5f] focus:outline-none focus:border-white text-sm"
                placeholder="Van-01"
              />
              {errors.name && <p className="text-[#ffb4ab] text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Type</label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white focus:outline-none focus:border-white text-sm appearance-none"
              >
                <option value="Van">Van</option>
                <option value="Truck">Truck</option>
                <option value="Mini">Mini</option>
              </select>
              {errors.type && <p className="text-[#ffb4ab] text-xs">{errors.type.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Region</label>
              <input
                {...register('region')}
                className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white placeholder-[#5d5f5f] focus:outline-none focus:border-white text-sm"
                placeholder="North"
              />
              {errors.region && <p className="text-[#ffb4ab] text-xs">{errors.region.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Max Load Capacity (kg)</label>
              <input
                type="number"
                {...register('maxLoadCapacityKg', { valueAsNumber: true })}
                className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white focus:outline-none focus:border-white text-sm font-mono"
              />
              {errors.maxLoadCapacityKg && <p className="text-[#ffb4ab] text-xs">{errors.maxLoadCapacityKg.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Odometer (km)</label>
              <input
                type="number"
                {...register('odometerKm', { valueAsNumber: true })}
                className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white focus:outline-none focus:border-white text-sm font-mono"
              />
              {errors.odometerKm && <p className="text-[#ffb4ab] text-xs">{errors.odometerKm.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Acquisition Cost ($)</label>
              <input
                type="number"
                {...register('acquisitionCost', { valueAsNumber: true })}
                className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white focus:outline-none focus:border-white text-sm font-mono"
              />
              {errors.acquisitionCost && <p className="text-[#ffb4ab] text-xs">{errors.acquisitionCost.message}</p>}
            </div>

            <div className="md:col-span-2 space-y-2 pt-4 border-t border-[#1F1F1F]">
              <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Vehicle Documents</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center justify-center gap-2 px-4 py-2 bg-[#131313] border border-[#1F1F1F] text-white rounded cursor-pointer hover:bg-[#1a1a1a] transition-colors text-sm">
                  <Upload size={16} /> Upload Document
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setIsUploading(true);
                        const fileName = e.target.files[0].name;
                        setTimeout(() => {
                          setUploadedDocs(prev => [...prev, { name: fileName, url: '#' }]);
                          setIsUploading(false);
                        }, 800);
                      }
                    }} 
                  />
                </label>
                {isUploading && <span className="text-sm text-[#8e9192] animate-pulse">Uploading...</span>}
              </div>
              {uploadedDocs.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  {uploadedDocs.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-[#48ddbc] bg-[#002019] px-3 py-1.5 rounded w-fit">
                      <FileText size={14} /> {doc.name}
                    </div>
                  ))}
                </div>
              )}
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
              className="px-4 py-2 text-sm font-medium text-black bg-white rounded hover:bg-[#e5e2e1] disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
