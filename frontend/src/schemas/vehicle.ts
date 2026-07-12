import { z } from 'zod';

export const vehicleSchema = z.object({
  registrationNumber: z.string().min(1, 'Registration Number is required').toUpperCase(),
  name: z.string().min(1, 'Name/Model is required'),
  type: z.string().min(1, 'Vehicle type is required'),
  maxLoadCapacityKg: z.number().min(1, 'Must be greater than 0'),
  odometerKm: z.number().min(0, 'Cannot be negative'),
  acquisitionCost: z.number().min(0, 'Cannot be negative'),
  region: z.string().min(1, 'Region is required'),
});

export type VehicleFormValues = z.infer<typeof vehicleSchema>;
