const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
//

require('dotenv').config();

// Connect to database
connectDB();

// Route files
const auth = require('./routes/authRoutes');
const tickets = require('./routes/ticketRoutes');
const faculty = require('./routes/facultyRoutes');
const faqs = require('./routes/faqRoutes');


const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

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

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});