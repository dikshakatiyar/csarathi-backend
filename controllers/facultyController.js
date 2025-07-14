const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// Sample faculty data
const facultyData = [
  {
    id: 1,
    name: 'Dr. Rajesh Kumar',
    department: 'Computer Science',
    email: 'rajesh.kumar@college.edu',
    phone: '+91 9876543210',
    designation: 'Professor'
  },
  {
    id: 2,
    name: 'Dr. Priya Sharma',
    department: 'Mathematics',
    email: 'priya.sharma@college.edu',
    phone: '+91 8765432109',
    designation: 'Associate Professor'
  },
  {
    id: 3,
    name: 'Dr. Amit Patel',
    department: 'Physics',
    email: 'amit.patel@college.edu',
    phone: '+91 7654321098',
    designation: 'Professor'
  },
  {
    id: 4,
    name: 'Dr. Sneha Gupta',
    department: 'Chemistry',
    email: 'sneha.gupta@college.edu',
    phone: '+91 6543210987',
    designation: 'Assistant Professor'
  },
  {
    id: 5,
    name: 'Dr. Vikram Singh',
    department: 'Electronics',
    email: 'vikram.singh@college.edu',
    phone: '+91 9432109876',
    designation: 'Professor'
  }
];

// @desc    Get all faculty contacts
// @route   GET /api/v1/faculty
// @access  Public
exports.getFacultyContacts = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    count: facultyData.length,
    data: facultyData
  });
});

// @desc    Get single faculty contact
// @route   GET /api/v1/faculty/:id
// @access  Public
exports.getFacultyContact = asyncHandler(async (req, res, next) => {
  const faculty = facultyData.find(f => f.id === parseInt(req.params.id));

  if (!faculty) {
    return next(
      new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: faculty
  });
});