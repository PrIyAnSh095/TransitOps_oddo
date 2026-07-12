const mongoose = require('mongoose');
const { Schema } = mongoose;

const vehicleSchema = new Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    vehicleName: {
      type: String,
      trim: true,
    },

    manufacturer: {
      type: String,
      trim: true,
    },

    model: {
      type: String,
      trim: true,
    },

    vehicleType: {
      type: String,
      enum: ['TRUCK', 'MINI_TRUCK', 'VAN', 'BUS', 'TRAILER'],
    },

    fuelType: {
      type: String,
      enum: ['DIESEL', 'PETROL', 'CNG', 'EV'],
    },

    maxLoadCapacity: {
      type: Number,
    },

    currentOdometer: {
      type: Number,
      default: 0,
    },

    acquisitionCost: {
      type: Number,
    },

    purchaseDate: {
      type: Date,
    },

    insuranceExpiry: {
      type: Date,
    },

    pollutionExpiry: {
      type: Date,
    },

    registrationExpiry: {
      type: Date,
    },

    region: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ['REGISTERED', 'AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED'],
      default: 'REGISTERED',
    },

    currentDriver: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    metadata: {
      createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
      updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      source: { type: String },
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports = Vehicle;