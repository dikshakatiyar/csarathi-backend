const express = require('express');
const {
  getFAQs,
  getFAQ,
  createFAQ,
  updateFAQ,
  deleteFAQ
} = require('../controllers/faqController');
const { protect, authorize } = require('../middleware/authController');
const advancedResults = require('../middleware/advancedResults');
const FAQ = require('../models/FAQ');

const router = express.Router();

router
  .route('/')
  .get(advancedResults(FAQ), getFAQs)
  .post(protect, authorize('admin'), createFAQ);

router
  .route('/:id')
  .get(getFAQ)
  .put(protect, authorize('admin'), updateFAQ)
  .delete(protect, authorize('admin'), deleteFAQ);

module.exports = router;