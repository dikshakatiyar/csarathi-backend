const Ticket = require('../models/Ticket');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc    Get all tickets
// @route   GET /api/v1/tickets
// @route   GET /api/v1/users/:userId/tickets
// @access  Private/Admin
exports.getTickets = asyncHandler(async (req, res, next) => {
  if (req.params.userId) {
    const tickets = await Ticket.find({ user: req.params.userId });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single ticket
// @route   GET /api/v1/tickets/:id
// @access  Private
exports.getTicket = asyncHandler(async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.id).populate({
    path: 'user',
    select: 'name email'
  });

  if (!ticket) {
    return next(
      new ErrorResponse(`No ticket found with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is ticket owner or admin
  if (ticket.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this ticket`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: ticket
  });
});

// @desc    Create ticket
// @route   POST /api/v1/tickets
// @access  Private
exports.createTicket = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const ticket = await Ticket.create(req.body);

  res.status(201).json({
    success: true,
    data: ticket
  });
});

// @desc    Update ticket
// @route   PUT /api/v1/tickets/:id
// @access  Private
exports.updateTicket = asyncHandler(async (req, res, next) => {
  let ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    return next(
      new ErrorResponse(`No ticket found with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is ticket owner or admin
  if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this ticket`,
        401
      )
    );
  }

  // If admin is resolving the ticket
  if (req.body.status === 'resolved' && req.user.role === 'admin') {
    req.body.resolvedAt = Date.now();
  }

  ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: ticket
  });
});

// @desc    Delete ticket
// @route   DELETE /api/v1/tickets/:id
// @access  Private
exports.deleteTicket = asyncHandler(async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    return next(
      new ErrorResponse(`No ticket found with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is ticket owner or admin
  if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this ticket`,
        401
      )
    );
  }

  await ticket.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get tickets for logged in user
// @route   GET /api/v1/tickets/my-tickets
// @access  Private
exports.getMyTickets = asyncHandler(async (req, res, next) => {
  const tickets = await Ticket.find({ user: req.user.id });

  res.status(200).json({
    success: true,
    count: tickets.length,
    data: tickets
  });
});