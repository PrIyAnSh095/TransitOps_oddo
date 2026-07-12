const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const { globalLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/error');
const authRoutes = require('./routes/auth.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const driverRoutes = require('./routes/driver.routes');
const tripRoutes = require('./routes/trip.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const expenseRoutes = require('./routes/expense.routes');
const reportRoutes = require('./routes/report.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const fuelLogRoutes = require('./routes/fuelLog.routes');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://your-production-url.com' : 'http://localhost:5173',
  credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(mongoSanitize());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Apply global rate limiter
app.use('/api', globalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/fuel-logs', fuelLogRoutes);
app.use('/api/reports', reportRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;