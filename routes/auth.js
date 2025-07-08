const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { check } = require('express-validator');

router.post('/register', [
  check('email').isEmail().normalizeEmail(),
  check('password').isLength({ min: 8 }),
  check('name').notEmpty().trim()
], authController.register);

router.post('/login', [
  check('email').isEmail().normalizeEmail(),
  check('password').exists()
], authController.login);

module.exports = router;