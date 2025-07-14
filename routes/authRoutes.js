const express = require('express');
const {
  register,
  login,
  getMe,
  initializeUsers
} = require('../controllers/authController');
const { protect } = require('../middleware/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/init', initializeUsers);

module.exports = router;