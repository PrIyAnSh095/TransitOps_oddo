import { z } from 'zod';

export const fuelLogSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  tripId: z.string().optional(),
  liters: z.number().min(0.1, 'Must be greater than 0'),
  cost: z.number().min(0.1, 'Must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
});

export type FuelLogCreateValues = z.infer<typeof fuelLogSchema>;

export const expenseSchema = z.object({
  tripId: z.string().optional(),
  vehicleId: z.string().optional(),
  type: z.enum(['Toll', 'Misc', 'Maintenance'], {
    message: 'Please select a valid expense type',
  }),
  amount: z.number().min(0.1, 'Must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
});

export type ExpenseCreateValues = z.infer<typeof expenseSchema>;
