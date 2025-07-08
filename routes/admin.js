const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const { check } = require('express-validator');

// Protect all admin routes
router.use(auth.protect, auth.restrictTo('admin'));

// User Management
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/role', [
  check('role').isIn(['student', 'admin']),
  check('id').isMongoId()
], adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// FAQ Management (Admin-only endpoints)
router.post('/faqs', [
  check('question').notEmpty().trim().escape(),
  check('answer').notEmpty().trim().escape(),
  check('category').optional().trim().escape()
], adminController.createFaq);

router.patch('/faqs/:id', [
  check('id').isMongoId(),
  check('question').optional().trim().escape(),
  check('answer').optional().trim().escape()
], adminController.updateFaq);

// Ticket Management
router.get('/tickets', adminController.getAllTickets);
router.get('/tickets/:id', adminController.getTicket);
router.patch('/tickets/:id/status', [
  check('id').isMongoId(),
  check('status').isIn(['open', 'in-progress', 'resolved']),
  check('response').optional().trim().escape()
], adminController.updateTicketStatus);

module.exports = router;