const mongoose = require('mongoose');
const { Schema } = mongoose;

const driverSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    photo: {
      type: String,
    },

    phone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    emergencyContact: {
      type: String,
      trim: true,
    },

    licenseNumber: {
      type: String,
      trim: true,
    },

    licenseCategory: {
      type: String,
      trim: true,
    },

    licenseExpiry: {
      type: Date,
    },

    joiningDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ['REGISTERED', 'AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED'],
      default: 'REGISTERED',
    },

    currentVehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
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

const Driver = mongoose.model('Driver', driverSchema);
module.exports = Driver;