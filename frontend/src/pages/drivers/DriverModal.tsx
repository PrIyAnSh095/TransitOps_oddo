import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { driverSchema, type DriverFormValues } from '../../schemas/driver';
import type { Driver } from '../../types';
import { createDriver, updateDriver } from '../../services/drivers';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (driver: Driver) => void;
  driver?: Driver;
  existingDrivers: Driver[];
}

export function DriverModal({ isOpen, onClose, onSaved, driver, existingDrivers }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: '',
      licenseNumber: '',
      licenseCategory: 'LMV',
      licenseExpiryDate: '',
      contactNumber: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (driver) {
        reset({
          name: driver.name,
          licenseNumber: driver.licenseNumber,
          licenseCategory: driver.licenseCategory,
          licenseExpiryDate: driver.licenseExpiryDate.split('T')[0], // format for input type="date"
          contactNumber: driver.contactNumber,
        });
      } else {
        reset({
          name: '',
          licenseNumber: '',
          licenseCategory: 'LMV',
          licenseExpiryDate: '',
          contactNumber: '',
        });
      }
    }
  }, [isOpen, driver, reset]);

  const onSubmit = async (data: DriverFormValues) => {
    // Client-side uniqueness check
    const isDuplicate = existingDrivers.some(
      (d) => d.licenseNumber === data.licenseNumber && d.id !== driver?.id
    );

    if (isDuplicate) {
      setError('licenseNumber', {
        type: 'manual',
        message: 'This license number is already registered to another driver.',
      });
      return;
    }

    try {
      // Ensure expiry date is stored in ISO format
      const isoDate = new Date(data.licenseExpiryDate).toISOString();
      const payload = { ...data, licenseExpiryDate: isoDate };

      let savedDriver: Driver;
      if (driver) {
        savedDriver = await updateDriver(driver.id, payload);
      } else {
        savedDriver = await createDriver(payload);
      }
      onSaved(savedDriver);
      onClose();
    } catch (err: any) {
      setError('root', { message: err.message || 'Failed to save driver' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#1F1F1F] bg-[#050505]">
          <h2 className="text-lg font-bold text-white font-sans tracking-tight">
            {driver ? 'Edit Driver' : 'Add New Driver'}
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
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Full Name</label>
              <input
                {...register('name')}
                className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white placeholder-[#5d5f5f] focus:outline-none focus:border-white text-sm"
                placeholder="John Doe"
              />
              {errors.name && <p className="text-[#ffb4ab] text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">License No.</label>
              <input
                {...register('licenseNumber')}
                className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white placeholder-[#5d5f5f] focus:outline-none focus:border-white text-sm font-mono uppercase"
                placeholder="DL-123456"
              />
              {errors.licenseNumber && <p className="text-[#ffb4ab] text-xs">{errors.licenseNumber.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Category</label>
              <select
                {...register('licenseCategory')}
                className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white focus:outline-none focus:border-white text-sm appearance-none"
              >
                <option value="LMV">LMV (Light Motor Vehicle)</option>
                <option value="HMV">HMV (Heavy Motor Vehicle)</option>
                <option value="MCWG">MCWG (Motorcycle with Gear)</option>
              </select>
              {errors.licenseCategory && <p className="text-[#ffb4ab] text-xs">{errors.licenseCategory.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Expiry Date</label>
              <input
                type="date"
                {...register('licenseExpiryDate')}
                className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white focus:outline-none focus:border-white text-sm font-mono [color-scheme:dark]"
              />
              {errors.licenseExpiryDate && <p className="text-[#ffb4ab] text-xs">{errors.licenseExpiryDate.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider text-[#c4c7c8] uppercase">Contact Number</label>
              <input
                {...register('contactNumber')}
                className="w-full px-3 py-2 bg-[#050505] border border-[#1F1F1F] rounded text-white placeholder-[#5d5f5f] focus:outline-none focus:border-white text-sm font-mono"
                placeholder="+1 234 567 890"
              />
              {errors.contactNumber && <p className="text-[#ffb4ab] text-xs">{errors.contactNumber.message}</p>}
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
              {isSubmitting ? 'Saving...' : 'Save Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
