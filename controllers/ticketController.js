const fs = require('fs'); // Add this with other imports
const path = require('path');
// ... other imports ...
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
    const tickets = await Ticket.find({ user: req.params.userId })
      .populate('user', 'name email')
      .populate('adminComments.admin', 'name role');

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
  const ticket = await Ticket.findById(req.params.id)
    .populate('user', 'name email')
    .populate('adminComments.admin', 'name role');

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

exports.createTicket = asyncHandler(async (req, res, next) => {
  // Check for required fields
  if (!req.body.title) {
    return next(new ErrorResponse('Please add a title', 400));
  }
  if (!req.body.category) {
    return next(new ErrorResponse('Please add a category', 400));
  }
  if (!req.body.description) {
    return next(new ErrorResponse('Please add a description', 400));
  }

  // Handle file upload
  let attachmentPath;
  if (req.files && req.files.attachment) {
    try {
      const attachment = req.files.attachment;
      const uploadDir = path.join(__dirname, '../public/uploads');
      
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${Date.now()}_${attachment.name}`;
      const filePath = path.join(uploadDir, fileName);
      
      await attachment.mv(filePath);
      attachmentPath = `/uploads/${fileName}`;
    } catch (err) {
      console.error('File upload error:', err);
      return next(new ErrorResponse('File upload failed', 500));
    }
  }

  // Create ticket
  const ticket = await Ticket.create({
    user: req.user.id,
    title: req.body.title,
    category: req.body.category,
    description: req.body.description,
    attachment: attachmentPath || undefined
  });

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

  // Admin-specific updates
  if (req.user.role === 'admin') {
    if (req.body.status === 'resolved') {
      req.body.resolvedAt = Date.now();
    }
    
    // Add admin comment if provided
    if (req.body.adminComment) {
      await ticket.addAdminComment(req.body.adminComment, req.user.id);
    }
  }

  // Prevent certain fields from being updated by non-admins
  if (req.user.role !== 'admin') {
    delete req.body.status;
    delete req.body.priority;
    delete req.body.resolvedAt;
  }

  ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('adminComments.admin', 'name role');

  res.status(200).json({
    success: true,
    data: ticket
  });
});

// @desc    Add admin comment to ticket
// @route   POST /api/v1/tickets/:id/comments
// @access  Private/Admin
exports.addComment = asyncHandler(async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    return next(
      new ErrorResponse(`No ticket found with the id of ${req.params.id}`, 404)
    );
  }

  if (!req.body.comment) {
    return next(new ErrorResponse('Please add a comment', 400));
  }

  await ticket.addAdminComment(req.body.comment, req.user.id);

  res.status(200).json({
    success: true,
    data: ticket
  });
});


// @desc    Delete ticket
// @route   DELETE /api/v1/tickets/:id
// @access  Private
exports.deleteTicket = asyncHandler(async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return next(
        new ErrorResponse(`No ticket found with the id of ${req.params.id}`, 404)
      );
    }

    // Authorization check
    if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete this ticket`,
          401
        )
      );
    }

    // Delete associated file if exists
    if (ticket.attachment) {
      const filePath = path.join(__dirname, '../public', ticket.attachment);
      
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Failed to delete attachment:', err);
          } else {
            console.log('Successfully deleted attachment:', filePath);
          }
        });
      }
    }

    // Modern deletion method - choose one approach:

    // OPTION 1: Using deleteOne() (explicit)
    // await Ticket.deleteOne({ _id: req.params.id });

    // OPTION 2: Using findByIdAndDelete() (more concise)
    await Ticket.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });

  } catch (error) {
    console.error('Error deleting ticket:', error);
    return next(
      new ErrorResponse('Failed to delete ticket', 500)
    );
  }
});


// @desc    Get user's tickets
// @route   GET /api/v1/tickets/my-tickets
// @access  Private
exports.getMyTickets = asyncHandler(async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean(); // Convert to plain JavaScript objects
    
    console.log(`Found ${tickets.length} tickets for user ${req.user.id}`); // Debug log
    
    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    next(new ErrorResponse('Failed to load tickets', 500));
  }
});

// @desc    Add admin comment to ticket
// @route   POST /api/v1/tickets/:id/comments
// @access  Private/Admin
exports.addComment = asyncHandler(async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.id);
  
  if (!ticket) {
    return next(new ErrorResponse(`Ticket not found with id ${req.params.id}`, 404));
  }

  if (!req.body.comment) {
    return next(new ErrorResponse('Please add a comment', 400));
  }

  const newComment = {
    comment: req.body.comment,
    admin: req.user.id,
    createdAt: Date.now()
  };

  ticket.adminComments.push(newComment);
  await ticket.save();

  // Populate admin details before sending response
  await ticket.populate('adminComments.admin', 'name role');

  res.status(200).json({
    success: true,
    data: ticket
  });
});