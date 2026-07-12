import { z } from 'zod';

export const tripCreateSchema = z.object({
  source: z.string().min(1, 'Source is required'),
  destination: z.string().min(1, 'Destination is required'),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  driverId: z.string().min(1, 'Driver is required'),
  cargoWeightKg: z.number().min(1, 'Must be greater than 0'),
  plannedDistanceKm: z.number().min(1, 'Must be greater than 0'),
});

export type TripCreateValues = z.infer<typeof tripCreateSchema>;

export const tripCompleteSchema = z.object({
  actualDistanceKm: z.number().min(1, 'Must be greater than 0'),
  fuelConsumedLiters: z.number().min(1, 'Must be greater than 0'),
});

export type TripCompleteValues = z.infer<typeof tripCompleteSchema>;
