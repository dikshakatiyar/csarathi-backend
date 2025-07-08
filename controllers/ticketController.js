const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/appError');

// @desc    Create new ticket
// @route   POST /api/v1/tickets
// @access  Student
exports.createTicket = async (req, res, next) => {
  try {
    // Verify user is a student
    if (req.user.role !== 'student') {
      throw new AppError(
        'Only students can create tickets', 
        StatusCodes.FORBIDDEN
      );
    }

    const ticket = await Ticket.create({
      studentId: req.user.id,
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority || 'medium'
    });

    // Populate student details
    await ticket.populate('studentId', 'name email');

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      data: { ticket }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged-in user's tickets
// @route   GET /api/v1/tickets/my-tickets
// @access  Student
exports.getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ studentId: req.user.id })
      .sort('-createdAt')
      .populate('studentId', 'name email');

    res.status(StatusCodes.OK).json({
      status: 'success',
      results: tickets.length,
      data: { tickets }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single ticket
// @route   GET /api/v1/tickets/:id
// @access  Student (own tickets) or Admin
exports.getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('studentId', 'name email');

    if (!ticket) {
      throw new AppError(
        'No ticket found with that ID', 
        StatusCodes.NOT_FOUND
      );
    }

    // Check authorization
    if (
      req.user.role !== 'admin' && 
      ticket.studentId._id.toString() !== req.user.id
    ) {
      throw new AppError(
        'Not authorized to access this ticket',
        StatusCodes.FORBIDDEN
      );
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { ticket }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add response to ticket
// @route   PATCH /api/v1/tickets/:id/response
// @access  Admin
exports.addResponse = async (req, res, next) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      throw new AppError(
        'Only admins can respond to tickets',
        StatusCodes.FORBIDDEN
      );
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { 
        response: req.body.response,
        status: 'in-progress' // Auto-update status
      },
      { new: true, runValidators: true }
    ).populate('studentId', 'name email');

    if (!ticket) {
      throw new AppError(
        'No ticket found with that ID',
        StatusCodes.NOT_FOUND
      );
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { ticket }
    });
  } catch (err) {
    next(err);
  }
};