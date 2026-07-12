const asyncHandler = require('express-async-handler');
const Expense = require('../models/Expense');
const { buildTimeSeriesPipeline, formatChartData } = require('../utils/analytics');

// @desc  Get all expenses
// @route GET /api/expenses
// @access Private
const getExpenses = asyncHandler(async (req, res) => {
  const { status, search, fromDate, toDate } = req.query;
  const match = {};

  if (fromDate || toDate) {
    match.expenseDate = {};
    if (fromDate) match.expenseDate.$gte = new Date(fromDate);
    if (toDate) match.expenseDate.$lte = new Date(toDate);
  }

  if (search) {
    match.$or = [
      { description: { $regex: search, $options: 'i' } },
      { expenseType: { $regex: search, $options: 'i' } }
    ];
  }

  const expenses = await Expense.find(match).populate('vehicle').sort({ expenseDate: -1 });

  // Map to frontend shape
  const formatted = expenses.map(e => ({
    id: e._id.toString(),
    vehicleId: e.vehicle?._id?.toString(),
    registrationNumber: e.vehicle?.registrationNumber || 'Unknown',
    tripId: e.trip?.toString(),
    type: e.expenseType,
    amount: e.amount,
    description: e.description,
    date: e.expenseDate ? e.expenseDate.toISOString() : e.createdAt.toISOString()
  }));

  res.json({
    success: true,
    data: formatted
  });
});

const getExpenseSummary = asyncHandler(async (req, res) => {
  const pipeline = buildTimeSeriesPipeline(req.query, 'expenseDate', {}, '$amount');
  const results = await Expense.aggregate(pipeline);
  const chartData = formatChartData(results, req.query.period || 'monthly');

  // Overall Stats
  const match = pipeline[0].$match;
  const statsResult = await Expense.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalExpenses: { $sum: '$amount' },
        fuelCost: { $sum: { $cond: [{ $eq: ['$expenseType', 'FUEL'] }, '$amount', 0] } },
        maintenanceCost: { $sum: { $cond: [{ $eq: ['$expenseType', 'MAINTENANCE'] }, '$amount', 0] } }
      }
    }
  ]);

  const stats = statsResult[0] || { totalExpenses: 0, fuelCost: 0, maintenanceCost: 0 };

  res.json({
    success: true,
    data: {
      chartData,
      stats: [
        { label: 'Total Expenses', value: `$${(stats.totalExpenses || 0).toLocaleString()}`, color: '#ff6b6b' },
        { label: 'Fuel Cost', value: `$${(stats.fuelCost || 0).toLocaleString()}`, color: '#ffc633' },
        { label: 'Maintenance Cost', value: `$${(stats.maintenanceCost || 0).toLocaleString()}`, color: '#558ded' },
        { label: 'Avg Cost/Km', value: '$1.24' } // Need real total distance for this later
      ]
    }
  });
});

// @desc  Create an expense
// @route POST /api/expenses
// @access Private
const createExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.create({
    ...req.body,
    expenseDate: req.body.date ? new Date(req.body.date) : new Date(),
    expenseType: req.body.type,
    metadata: {
      createdBy: req.user?._id
    }
  });
  
  res.status(201).json({
    success: true,
    data: expense
  });
});

const getExpenseById = asyncHandler(async (req, res) => {
  const expenseService = require('../services/expense.service');
  const expense = await expenseService.getExpenseById(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Expense fetched successfully',
    data: expense,
  });
});

module.exports = { getExpenses, getExpenseSummary, createExpense, getExpenseById };
