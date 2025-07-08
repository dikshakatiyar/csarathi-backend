const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const auth = require('../middleware/auth');
const { check } = require('express-validator');

// Public routes
router.get('/', faqController.getAllFaqs);
router.get('/search', faqController.searchFaqs);

// Admin-protected routes
router.use(auth.protect, auth.restrictTo('admin'));

router.post('/', [
  check('question').notEmpty().trim(),
  check('answer').notEmpty().trim()
], faqController.createFaq);

router.patch('/:id', faqController.updateFaq);
router.delete('/:id', faqController.deleteFaq);

module.exports = router;