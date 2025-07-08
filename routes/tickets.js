const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const auth = require('../middleware/auth');
const { check } = require('express-validator');

// Protect all ticket routes
router.use(auth.protect);

// Student-accessible routes
router.post('/', [
  check('title').notEmpty().trim().escape().withMessage('Title is required'),
  check('description').notEmpty().trim().escape().withMessage('Description is required'),
  check('priority').optional().isIn(['low', 'medium', 'high'])
], ticketController.createTicket);

router.get('/my-tickets', ticketController.getMyTickets);
router.get('/:id', [
  check('id').isMongoId().withMessage('Invalid ticket ID')
], ticketController.getTicket);

// Admin-only routes (restricted via controller)
router.patch('/:id/response', [
  check('id').isMongoId().withMessage('Invalid ticket ID'),
  check('response').notEmpty().trim().escape()
], ticketController.addResponse);

module.exports = router;