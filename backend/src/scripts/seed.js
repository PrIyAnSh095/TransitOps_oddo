require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker/locale/en_IN');

// Models
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const MaintenanceLog = require('../models/MaintananceLog');
const FuelLog = require('../models/FuelLog');
const Expense = require('../models/Expense');
const VehicleStatusHistory = require('../models/VehicleStatusHistory');
const DriverStatusHistory = require('../models/DriverStatusHistory');

// Configuration
const COUNTS = {
  VEHICLES: 50,
  DRIVERS: 45,
  TRIPS: 400,
  MAINTENANCE_LOGS: 350,
  FUEL_LOGS: 900,
  EXPENSES: 450,
};

// Data sets for realism
const MANUFACTURERS = ['Tata Motors', 'Ashok Leyland', 'Mahindra', 'Eicher', 'BharatBenz'];
const VEHICLE_TYPES = ['TRUCK', 'MINI_TRUCK', 'VAN', 'BUS', 'TRAILER'];
const FUEL_TYPES = ['DIESEL', 'PETROL', 'CNG', 'EV'];
const REGIONS = ['North', 'South', 'East', 'West', 'Central'];
const LICENSE_CATEGORIES = ['LMV', 'HMV', 'TRANS'];
const INDIAN_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar', 'Varanasi', 'Srinagar'];
const CARGO_TYPES = ['Electronics', 'FMCG', 'Textiles', 'Pharmaceuticals', 'Automotive Parts', 'Furniture', 'Agriculture', 'Construction Materials', 'Chemicals'];

// Helper for dates in the past year
const randomDate = (startDaysAgo = 365, endDaysAgo = 0) => {
  const start = Date.now() - startDaysAgo * 24 * 60 * 60 * 1000;
  const end = Date.now() - endDaysAgo * 24 * 60 * 60 * 1000;
  return new Date(start + Math.random() * (end - start));
};

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to DB: ${error.message}`);
    process.exit(1);
  }
}

async function clearCollections() {
  console.log('Clearing existing data (except Users)...');
  await Vehicle.deleteMany();
  await Driver.deleteMany();
  await Trip.deleteMany();
  await MaintenanceLog.deleteMany();
  await FuelLog.deleteMany();
  await Expense.deleteMany();
  await VehicleStatusHistory.deleteMany();
  await DriverStatusHistory.deleteMany();
  console.log('Data cleared.');
}

async function seedData() {
  console.log('Seeding data... This may take a moment.');

  // Find a user to set as creator (fallback to null if no users)
  const defaultUser = await User.findOne();
  const userId = defaultUser ? defaultUser._id : null;

  // 1. Seed Vehicles
  const vehicles = [];
  for (let i = 0; i < COUNTS.VEHICLES; i++) {
    const manufacturer = faker.helpers.arrayElement(MANUFACTURERS);
    const vehicleType = faker.helpers.arrayElement(VEHICLE_TYPES);
    vehicles.push(new Vehicle({
      registrationNumber: `MH${faker.string.numeric({ length: 2, allowLeadingZeros: true })} ${faker.string.alpha({ length: 2, casing: 'upper' })} ${faker.string.numeric(4)}`,
      vehicleName: `${manufacturer} ${vehicleType.replace('_', ' ')} ${faker.string.numeric(2)}`,
      manufacturer,
      model: `${faker.word.noun()} ${faker.string.numeric(4)}`,
      vehicleType,
      fuelType: faker.helpers.arrayElement(FUEL_TYPES),
      maxLoadCapacity: faker.number.int({ min: 1000, max: 20000 }),
      currentOdometer: faker.number.int({ min: 5000, max: 150000 }),
      acquisitionCost: faker.number.int({ min: 800000, max: 4000000 }),
      purchaseDate: randomDate(1825, 365), // 1 to 5 years ago
      insuranceExpiry: faker.date.future({ years: 1 }),
      pollutionExpiry: faker.date.future({ years: 1 }),
      registrationExpiry: faker.date.future({ years: 5 }),
      region: faker.helpers.arrayElement(REGIONS),
      status: faker.helpers.arrayElement(['AVAILABLE', 'AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED']),
      isActive: true,
      metadata: { createdBy: userId }
    }));
  }
  const savedVehicles = await Vehicle.insertMany(vehicles);
  console.log(`- Inserted ${savedVehicles.length} Vehicles.`);

  // 2. Seed Drivers
  const drivers = [];
  for (let i = 0; i < COUNTS.DRIVERS; i++) {
    drivers.push(new Driver({
      firstName: faker.person.firstName('male'),
      lastName: faker.person.lastName('male'),
      phone: `+91 ${faker.string.numeric(10)}`,
      email: faker.internet.email().toLowerCase(),
      emergencyContact: `+91 ${faker.string.numeric(10)}`,
      licenseNumber: `DL-${faker.string.numeric(13)}`,
      licenseCategory: faker.helpers.arrayElement(LICENSE_CATEGORIES),
      licenseExpiry: faker.date.future({ years: 3 }),
      joiningDate: randomDate(1095, 100), // 100 days to 3 years ago
      status: faker.helpers.arrayElement(['AVAILABLE', 'AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED']),
      safetyScore: faker.number.int({ min: 60, max: 100 }),
      isActive: true,
      metadata: { createdBy: userId }
    }));
  }
  const savedDrivers = await Driver.insertMany(drivers);
  console.log(`- Inserted ${savedDrivers.length} Drivers.`);

  // 3. Seed Trips
  const trips = [];
  for (let i = 0; i < COUNTS.TRIPS; i++) {
    const startOdometer = faker.number.int({ min: 1000, max: 100000 });
    const plannedDistance = faker.number.int({ min: 50, max: 1500 });
    const actualDistance = plannedDistance + faker.number.int({ min: -20, max: 50 });
    const status = faker.helpers.arrayElement(['COMPLETED', 'COMPLETED', 'COMPLETED', 'DISPATCHED', 'CANCELLED', 'DRAFT']);
    const isCompleted = status === 'COMPLETED';
    
    const dispatchTime = randomDate(365, isCompleted ? 2 : 0);
    const completionTime = isCompleted ? new Date(dispatchTime.getTime() + actualDistance * 2 * 60 * 1000) : null;
    
    trips.push(new Trip({
      tripNumber: `TR${faker.string.numeric(6)}`,
      vehicle: faker.helpers.arrayElement(savedVehicles)._id,
      driver: faker.helpers.arrayElement(savedDrivers)._id,
      source: faker.helpers.arrayElement(INDIAN_CITIES),
      destination: faker.helpers.arrayElement(INDIAN_CITIES),
      cargoType: faker.helpers.arrayElement(CARGO_TYPES),
      cargoWeight: faker.number.int({ min: 500, max: 18000 }),
      plannedDistance,
      actualDistance: isCompleted ? actualDistance : undefined,
      estimatedDuration: plannedDistance * 2, // rough approx
      actualDuration: isCompleted ? actualDistance * 2.2 : undefined,
      startOdometer,
      endOdometer: isCompleted ? startOdometer + actualDistance : undefined,
      revenue: faker.number.int({ min: 10000, max: 150000 }),
      fuelUsed: isCompleted ? actualDistance / 4 : undefined,
      expense: faker.number.int({ min: 500, max: 5000 }),
      dispatchTime,
      completionTime,
      status,
      metadata: { createdBy: userId }
    }));
  }
  const savedTrips = await Trip.insertMany(trips);
  console.log(`- Inserted ${savedTrips.length} Trips.`);

  // 4. Seed Fuel Logs
  const fuelLogs = [];
  for (let i = 0; i < COUNTS.FUEL_LOGS; i++) {
    const litres = faker.number.int({ min: 20, max: 200 });
    const pricePerLitre = faker.number.float({ min: 89, max: 105, fractionDigits: 2 });
    fuelLogs.push(new FuelLog({
      vehicle: faker.helpers.arrayElement(savedVehicles)._id,
      trip: faker.datatype.boolean() ? faker.helpers.arrayElement(savedTrips)._id : null,
      litres,
      pricePerLitre,
      cost: Math.round(litres * pricePerLitre),
      odometer: faker.number.int({ min: 5000, max: 150000 }),
      station: `${faker.company.name()} Petrol Pump`,
      paymentMethod: faker.helpers.arrayElement(['CARD', 'UPI', 'CASH']),
      fuelDate: randomDate(365, 0),
      metadata: { createdBy: userId }
    }));
  }
  const savedFuelLogs = await FuelLog.insertMany(fuelLogs);
  console.log(`- Inserted ${savedFuelLogs.length} Fuel Logs.`);

  // 5. Seed Maintenance Logs
  const maintenanceLogs = [];
  for (let i = 0; i < COUNTS.MAINTENANCE_LOGS; i++) {
    const status = faker.helpers.arrayElement(['SCHEDULED', 'ACTIVE', 'COMPLETED', 'COMPLETED', 'COMPLETED']);
    const isCompleted = status === 'COMPLETED';
    const isScheduled = status === 'SCHEDULED';
    
    // Scheduled maintenance might be in the future (negative endDaysAgo makes it future)
    const startDate = randomDate(365, isScheduled ? -30 : 2); 
    const completionDate = isCompleted ? new Date(startDate.getTime() + faker.number.int({ min: 1, max: 7 }) * 24 * 60 * 60 * 1000) : null;
    const estCost = faker.number.int({ min: 2000, max: 25000 });
    
    maintenanceLogs.push(new MaintenanceLog({
      vehicle: faker.helpers.arrayElement(savedVehicles)._id,
      maintenanceType: faker.helpers.arrayElement(['Oil Change', 'Tire Replacement', 'Engine Tuning', 'Brake Inspection', 'General Service', 'Battery Replacement', 'Transmission Repair', 'Body Work']),
      description: faker.lorem.sentence(),
      vendor: `${faker.person.lastName()} Auto Works`,
      estimatedCost: estCost,
      actualCost: isCompleted ? Math.max(500, estCost + faker.number.int({ min: -1000, max: 3000 })) : undefined,
      startDate,
      completionDate,
      nextServiceDue: new Date(startDate.getTime() + faker.number.int({ min: 30, max: 180 }) * 24 * 60 * 60 * 1000), 
      status,
      metadata: { createdBy: userId }
    }));
  }
  const savedMaintenanceLogs = await MaintenanceLog.insertMany(maintenanceLogs);
  console.log(`- Inserted ${savedMaintenanceLogs.length} Maintenance Logs.`);

  // 6. Seed Expenses
  const expenses = [];
  for (let i = 0; i < COUNTS.EXPENSES; i++) {
    expenses.push(new Expense({
      vehicle: faker.helpers.arrayElement(savedVehicles)._id,
      trip: faker.datatype.boolean() ? faker.helpers.arrayElement(savedTrips)._id : null,
      expenseType: faker.helpers.arrayElement(['TOLL', 'PARKING', 'FINE', 'OTHER']),
      amount: faker.number.int({ min: 100, max: 5000 }),
      description: faker.lorem.words(3),
      paymentMethod: faker.helpers.arrayElement(['CASH', 'UPI', 'CARD']),
      expenseDate: randomDate(365, 0),
      metadata: { createdBy: userId }
    }));
  }
  // Let's also add maintenance and fuel expenses mirroring some of the logs just to have diversity
  for (let i = 0; i < 50; i++) {
    expenses.push(new Expense({
      vehicle: savedVehicles[i % savedVehicles.length]._id,
      expenseType: 'MAINTENANCE',
      amount: faker.number.int({ min: 2000, max: 15000 }),
      description: 'Routine maintenance',
      paymentMethod: 'BANK_TRANSFER',
      expenseDate: randomDate(365, 0),
      metadata: { createdBy: userId }
    }));
  }
  const savedExpenses = await Expense.insertMany(expenses);
  console.log(`- Inserted ${savedExpenses.length} Expense Logs.`);

  // 7. Seed Status History
  const vehicleHistory = [];
  for (let i = 0; i < 1000; i++) {
    vehicleHistory.push(new VehicleStatusHistory({
      vehicle: faker.helpers.arrayElement(savedVehicles)._id,
      previousStatus: faker.helpers.arrayElement(['AVAILABLE', 'ON_TRIP', 'IN_SHOP']),
      newStatus: faker.helpers.arrayElement(['AVAILABLE', 'ON_TRIP', 'IN_SHOP']),
      reason: faker.helpers.arrayElement(['TRIP_DISPATCHED', 'TRIP_COMPLETED', 'MAINTENANCE_STARTED', 'MAINTENANCE_COMPLETED']),
      createdAt: randomDate(365, 0),
      metadata: { createdBy: userId }
    }));
  }
  await VehicleStatusHistory.insertMany(vehicleHistory);
  console.log(`- Inserted ${vehicleHistory.length} Vehicle Status Histories.`);

  const driverHistory = [];
  for (let i = 0; i < 800; i++) {
    driverHistory.push(new DriverStatusHistory({
      driver: faker.helpers.arrayElement(savedDrivers)._id,
      previousStatus: faker.helpers.arrayElement(['AVAILABLE', 'ON_TRIP', 'OFF_DUTY']),
      newStatus: faker.helpers.arrayElement(['AVAILABLE', 'ON_TRIP', 'OFF_DUTY']),
      reason: faker.helpers.arrayElement(['TRIP_DISPATCHED', 'TRIP_COMPLETED', 'SHIFT_ENDED', 'SHIFT_STARTED']),
      createdAt: randomDate(365, 0),
      metadata: { createdBy: userId }
    }));
  }
  await DriverStatusHistory.insertMany(driverHistory);
  console.log(`- Inserted ${driverHistory.length} Driver Status Histories.`);

  console.log('Seeding completed successfully!');
}

const isResetOnly = process.argv.includes('--reset');

connectDB().then(async () => {
  await clearCollections();
  if (!isResetOnly) {
    await seedData();
  }
  process.exit(0);
});
