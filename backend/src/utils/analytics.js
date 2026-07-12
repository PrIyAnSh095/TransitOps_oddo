const mongoose = require('mongoose');

/**
 * Builds a dynamic aggregation pipeline based on time periods and filters
 * @param {Object} query - req.query object (e.g., { period: 'weekly', status: 'Completed', fromDate: '...' })
 * @param {String} dateField - The date field to group by (e.g., 'createdAt', 'dispatchTime')
 * @param {Object} customMatch - Additional match conditions
 * @param {String} valueField - The field to aggregate for charts (e.g., 1 for count, '$amount' for sum)
 * @returns {Array} - MongoDB aggregation pipeline
 */
function buildTimeSeriesPipeline(query, dateField = 'createdAt', customMatch = {}, valueField = 1) {
  const { period = 'monthly', fromDate, toDate, status, vehicle, driver } = query;
  const match = { ...customMatch };

  // Date Filtering
  if (fromDate || toDate) {
    match[dateField] = {};
    if (fromDate) match[dateField].$gte = new Date(fromDate);
    if (toDate) match[dateField].$lte = new Date(toDate);
  }

  // Common filters
  if (status && status !== 'All') match.status = status.toUpperCase();
  if (vehicle) match.vehicle = mongoose.Types.ObjectId(vehicle);
  if (driver) match.driver = mongoose.Types.ObjectId(driver);

  // Determine Grouping bucketing based on period
  let groupId = {};
  let sortId = {};

  if (period === 'weekly') {
    // Group by Day of Week
    groupId = {
      year: { $year: `$${dateField}` },
      month: { $month: `$${dateField}` },
      day: { $dayOfMonth: `$${dateField}` },
      dayOfWeek: { $dayOfWeek: `$${dateField}` }
    };
    sortId = { '_id.year': 1, '_id.month': 1, '_id.day': 1 };
  } else if (period === 'monthly') {
    // Group by Day of Month
    groupId = {
      year: { $year: `$${dateField}` },
      month: { $month: `$${dateField}` },
      day: { $dayOfMonth: `$${dateField}` }
    };
    sortId = { '_id.year': 1, '_id.month': 1, '_id.day': 1 };
  } else if (period === 'yearly') {
    // Group by Month
    groupId = {
      year: { $year: `$${dateField}` },
      month: { $month: `$${dateField}` }
    };
    sortId = { '_id.year': 1, '_id.month': 1 };
  }

  // Construct Value Expression
  let valueExpression = {};
  if (valueField === 1) {
    valueExpression = { value: { $sum: 1 } };
  } else {
    valueExpression = { value: { $sum: valueField } };
  }

  return [
    { $match: match },
    {
      $group: {
        _id: groupId,
        ...valueExpression
      }
    },
    { $sort: sortId },
    { $limit: 30 }
  ];
}

/**
 * Format the aggregation results for Recharts
 */
function formatChartData(results, period) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return results.map(item => {
    let name = '';
    if (period === 'weekly') {
      name = days[(item._id.dayOfWeek - 1) % 7];
    } else if (period === 'monthly') {
      name = `${item._id.day} ${months[(item._id.month - 1) % 12]}`;
    } else if (period === 'yearly') {
      name = months[(item._id.month - 1) % 12];
    }
    return { name, value: item.value };
  });
}

module.exports = {
  buildTimeSeriesPipeline,
  formatChartData
};
