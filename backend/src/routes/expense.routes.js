const express = require('express');
const router = express.Router();
const {
  getExpenses,
  getExpenseById,
  createExpense,
} = require('../controllers/expense.controller');
const { protect } = require('../middleware/auth');
const { globalLimiter } = require('../middleware/rateLimiter');

router.use(protect);
router.use(globalLimiter);

router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.route('/:id')
  .get(getExpenseById);

module.exports = router;
