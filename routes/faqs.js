const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const auth = require('../middleware/auth');
const { check } = require('express-validator');
const validate = require('../middleware/validate');

// Public routes (no auth needed)
router.get('/', faqController.getAllFaqs);
router.get('/search', faqController.searchFaqs);

// Admin-protected routes
router.use(auth.protect); // Verify JWT first
router.use(auth.restrictTo('admin')); // Then check role

// Create FAQ (with validation)
router.post(
  '/',
  [
    check('question')
      .notEmpty()
      .withMessage('Question is required')
      .trim()
      .escape(),
    check('answer')
      .notEmpty()
      .withMessage('Answer is required')
      .trim()
      .escape()
  ],
  validate, // Handle validation errors
  faqController.createFaq
);

// Update FAQ
router.patch(
  '/:id',
  [
    check('id').isMongoId().withMessage('Invalid FAQ ID'),
    check('question').optional().trim().escape(),
    check('answer').optional().trim().escape()
  ],
  validate,
  faqController.updateFaq
);

// Delete FAQ
router.delete(
  '/:id',
  [check('id').isMongoId().withMessage('Invalid FAQ ID')],
  validate,
  faqController.deleteFaq
);

module.exports = router;