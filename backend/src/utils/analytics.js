const mongoose = require('mongoose');

/**
 * Builds a dynamic aggregation pipeline based on time periods and filters
 * @param {Object} query - req.query object (e.g., { period: 'weekly', status: 'Completed', fromDate: '...' })
 * @param {String} dateField - The date field to group by (e.g., 'createdAt', 'dispatchTime')
 * @param {Object} customMatch - Additional match conditions
 * @param {String|Object} valueField - The field to aggregate for charts (e.g., 1 for count, '$amount' for sum, or object for multi)
 * @returns {Array} - MongoDB aggregation pipeline
 */
function buildTimeSeriesPipeline(query, dateField = 'createdAt', customMatch = {}, valueField = 1) {
  const { period = 'monthly', status, vehicle, driver } = query;
  let { fromDate, toDate } = query;
  const match = { ...customMatch };

  // Set default dates if not provided based on period
  if (!fromDate || !toDate) {
    const end = toDate ? new Date(toDate) : new Date();
    const start = fromDate ? new Date(fromDate) : new Date(end);
    
    if (!fromDate) {
      if (period === 'weekly') {
        start.setMonth(start.getMonth() - 2); // Show last ~8-9 weeks
      } else if (period === 'monthly') {
        start.setFullYear(start.getFullYear() - 1); // Show last 12 months
      } else if (period === 'yearly') {
        start.setFullYear(start.getFullYear() - 5); // Show last 5 years
      }
    }
    fromDate = start.toISOString();
    toDate = end.toISOString();
  }

  // Date Filtering
  match[dateField] = {
    $gte: new Date(fromDate),
    $lte: new Date(toDate)
  };

  // Common filters
  if (status && status !== 'All') match.status = status.toUpperCase();
  if (vehicle) match.vehicle = mongoose.Types.ObjectId(vehicle);
  if (driver) match.driver = mongoose.Types.ObjectId(driver);

  // Determine Grouping bucketing based on period
  let groupId = {};
  let sortId = {};

  if (period === 'weekly') {
    groupId = {
      year: { $isoWeekYear: `$${dateField}` },
      week: { $isoWeek: `$${dateField}` }
    };
    sortId = { '_id.year': 1, '_id.week': 1 };
  } else if (period === 'monthly') {
    groupId = {
      year: { $year: `$${dateField}` },
      month: { $month: `$${dateField}` }
    };
    sortId = { '_id.year': 1, '_id.month': 1 };
  } else if (period === 'yearly') {
    groupId = {
      year: { $year: `$${dateField}` }
    };
    sortId = { '_id.year': 1 };
  }

  // Construct Value Expression
  let valueExpression = {};
  if (valueField === 1) {
    valueExpression = { value: { $sum: 1 } };
  } else if (typeof valueField === 'object' && valueField !== null && !Array.isArray(valueField) && !Object.keys(valueField).some(k => k.startsWith('$'))) {
    // Object mapping for multiple values (e.g. { revenue: { $sum: '$revenue' }, cost: { $sum: '$cost' } })
    valueExpression = valueField;
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
    { $sort: sortId }
  ];
}

/**
 * Format the aggregation results for Recharts and fill gaps in dates
 * @param {Array} results - Aggregation results from DB
 * @param {String} period - 'weekly', 'monthly', 'yearly'
 * @param {Object} options - Config options for keys and default values
 */
function formatChartData(results, period, options = {}) {
  const { labelKey = 'name', valueKey = 'value', fromDate, toDate, defaultValue = 0, multiValues = [] } = options;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Fill gaps logic
  const end = toDate ? new Date(toDate) : new Date();
  const start = fromDate ? new Date(fromDate) : new Date(end);
  if (!fromDate) {
    if (period === 'weekly') start.setMonth(start.getMonth() - 2);
    else if (period === 'monthly') start.setFullYear(start.getFullYear() - 1);
    else if (period === 'yearly') start.setFullYear(start.getFullYear() - 5);
  }

  const chartData = [];
  let current = new Date(start);

  const createEntry = (label, resultItem) => {
    const entry = { [labelKey]: label };
    if (multiValues.length > 0) {
      multiValues.forEach(key => {
        entry[key] = resultItem && resultItem[key] !== undefined ? resultItem[key] : defaultValue;
      });
    } else {
      entry[valueKey] = resultItem && resultItem.value !== undefined ? resultItem.value : defaultValue;
    }
    return entry;
  };

  if (period === 'weekly') {
    while (current <= end) {
      const d = new Date(current);
      d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
      const weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
      const isoYear = d.getUTCFullYear();
      
      const label = `W${weekNo} ${isoYear}`;
      const found = results.find(r => r._id && r._id.year === isoYear && r._id.week === weekNo);
      
      if (!chartData.find(c => c[labelKey] === label)) {
        chartData.push(createEntry(label, found));
      }
      current.setDate(current.getDate() + 7);
    }
  } else if (period === 'monthly') {
    current.setDate(1);
    while (current <= end || (current.getFullYear() === end.getFullYear() && current.getMonth() === end.getMonth())) {
      const y = current.getFullYear();
      const m = current.getMonth() + 1;
      const label = `${months[m - 1]} ${y}`;
      const found = results.find(r => r._id && r._id.year === y && r._id.month === m);
      chartData.push(createEntry(label, found));
      current.setMonth(current.getMonth() + 1);
    }
  } else if (period === 'yearly') {
    current.setMonth(0);
    current.setDate(1);
    while (current.getFullYear() <= end.getFullYear()) {
      const y = current.getFullYear();
      const label = `${y}`;
      const found = results.find(r => r._id && r._id.year === y);
      chartData.push(createEntry(label, found));
      current.setFullYear(current.getFullYear() + 1);
    }
  }

  return chartData;
}

module.exports = {
  buildTimeSeriesPipeline,
  formatChartData
};
