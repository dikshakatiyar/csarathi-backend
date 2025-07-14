// routes/facultyRoutes.js
const express = require('express');
const {
  getFacultyContacts,
  getFacultyContact
} = require('../controllers/facultyController');

const router = express.Router();

router.route('/')
  .get(getFacultyContacts);

router.route('/:id')
  .get(getFacultyContact);

module.exports = router;