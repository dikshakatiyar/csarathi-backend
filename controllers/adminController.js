const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Faq = require('../models/Faq');
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/appError');

// User Management
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('-password -__v')
      .sort('-createdAt');
    
    res.status(StatusCodes.OK).json({
      status: 'success',
      results: users.length,
      data: { users }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return next(new AppError('No user found with that ID', StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { user }
    });
  } catch (err) {
    next(err);
  }
};

// FAQ Management
exports.createFaq = async (req, res, next) => {
  try {
    const faq = await Faq.create(req.body);
    
    res.status(StatusCodes.CREATED).json({
      status: 'success',
      data: { faq }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateFaq = async (req, res, next) => {
  try {
    const faq = await Faq.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!faq) {
      return next(new AppError('No FAQ found with that ID', StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { faq }
    });
  } catch (err) {
    next(err);
  }
};

// Ticket Management
exports.getAllTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find()
      .populate({
        path: 'studentId',
        select: 'name email'
      })
      .sort('-createdAt');

    res.status(StatusCodes.OK).json({
      status: 'success',
      results: tickets.length,
      data: { tickets }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateTicketStatus = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        response: req.body.response || undefined
      },
      { new: true, runValidators: true }
    ).populate('studentId', 'name email');

    if (!ticket) {
      return next(new AppError('No ticket found with that ID', StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { ticket }
    });
  } catch (err) {
    next(err);
  }
};