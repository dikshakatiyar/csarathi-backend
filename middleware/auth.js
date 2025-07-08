const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { check } = require('express-validator');
const validate = require('../middleware/validate');

// Register
router.post('/register', [
  check('email').isEmail().normalizeEmail(),
  check('password').isLength({ min: 8 }),
  check('name').notEmpty().trim().escape(),
  check('role').optional().isIn(['student', 'admin'])
], validate, authController.register);

// Login
router.post('/login', [
  check('email').isEmail().normalizeEmail(),
  check('password').exists()
], validate, authController.login);

// Refresh Token
router.post('/refresh-token', authController.refreshToken);

// Logout
router.post('/logout', authController.logout);

module.exports = router;