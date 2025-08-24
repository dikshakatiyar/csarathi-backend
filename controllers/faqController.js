const FAQ = require('../models/FAQ');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all FAQs
// @route   GET /api/v1/faqs
// @access  Public
exports.getFAQs = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single FAQ
// @route   GET /api/v1/faqs/:id
// @access  Public
exports.getFAQ = asyncHandler(async (req, res, next) => {
  const faq = await FAQ.findById(req.params.id);

  if (!faq) {
    return next(
      new ErrorResponse(`No FAQ found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: faq
  });
});

// @desc    Create FAQ
// @route   POST /api/v1/faqs
// @access  Private/Admin
exports.createFAQ = asyncHandler(async (req, res, next) => {
  const faq = await FAQ.create(req.body);

  res.status(201).json({
    success: true,
    data: faq
  });
});

// @desc    Update FAQ
// @route   PUT /api/v1/faqs/:id
// @access  Private/Admin
exports.updateFAQ = asyncHandler(async (req, res, next) => {
  let faq = await FAQ.findById(req.params.id);

  if (!faq) {
    return next(
      new ErrorResponse(`No FAQ found with the id of ${req.params.id}`, 404)
    );
  }

  faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: faq
  });
});

// @desc    Delete FAQ
// @route   DELETE /api/v1/faqs/:id
// @access  Private/Admin
exports.deleteFAQ = asyncHandler(async (req, res, next) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return next(
        new ErrorResponse(`No FAQ found with the id of ${req.params.id}`, 404)
      );
    }

    // Modern deletion method - choose one of these options:

    // OPTION 1: Using deleteOne() (explicit)
    // await FAQ.deleteOne({ _id: req.params.id });

    // OPTION 2: Using findByIdAndDelete() (more concise)
    await FAQ.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });

  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return next(
      new ErrorResponse('Failed to delete FAQ', 500)
    );
  }
});