const express = require('express');
const router = express.Router();
const { createUser, getUsers } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

router.get('/', protect, getUsers);
router.post('/', protect, createUser);

module.exports = router;
