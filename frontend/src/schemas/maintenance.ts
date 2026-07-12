import { z } from 'zod';

export const maintenanceCreateSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  serviceType: z.string().min(1, 'Service type is required'),
  cost: z.number().min(0, 'Cost cannot be negative'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

export type MaintenanceCreateValues = z.infer<typeof maintenanceCreateSchema>;
