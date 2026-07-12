import { z } from 'zod';

export const driverSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  licenseNumber: z.string().min(1, 'License Number is required').toUpperCase(),
  licenseCategory: z.string().min(1, 'License Category is required'),
  licenseExpiryDate: z.string().min(1, 'Expiry Date is required'),
  contactNumber: z.string().min(1, 'Contact Number is required'),
});

export type DriverFormValues = z.infer<typeof driverSchema>;
