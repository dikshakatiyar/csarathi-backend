const express = require('express');
const {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  getMyTickets,
  addComment
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/authController');
const advancedResults = require('../middleware/advancedResults');
const Ticket = require('../models/Ticket');

const router = express.Router();

// Re-route into other resource routers

router
  .route('/')
  .get(protect, authorize('admin'), advancedResults(Ticket, 'user'), getTickets)
  .post(protect, createTicket);

router.get('/my-tickets', protect, getMyTickets);

router
  .route('/:id')
  .get(protect, getTicket)
  .put(protect, updateTicket)
  .delete(protect, deleteTicket);

// Admin comments endpoint
router
  .route('/:id/comments')
  .post(protect, authorize('admin'), addComment);

module.exports = router;