const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getAnalytics } = require('../controllers/report.controller');

router.use(protect);

router.get('/analytics', getAnalytics);

module.exports = router;
