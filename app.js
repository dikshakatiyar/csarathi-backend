const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
const fileUpload = require('express-fileupload');

// Load env vars
require('dotenv').config();

// Connect to database
connectDB();

const app = express();

// Enable CORS - should be first middleware
app.use(cors());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File upload middleware - must come before express.json()
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true // Create upload directory if it doesn't exist
}));

// Body parser - must come after fileUpload
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Route files
const auth = require('./routes/authRoutes');
const tickets = require('./routes/ticketRoutes');
const faculty = require('./routes/facultyRoutes');
const faqs = require('./routes/faqRoutes');

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/tickets', tickets);
app.use('/api/v1/faqs', faqs);
app.use('/api/v1/faculty', faculty);

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});