require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('./config/cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { StatusCodes } = require('http-status-codes');

// Import routes
const authRoutes = require('./routes/auth');
const faqRoutes = require('./routes/faqs');
const ticketRoutes = require('./routes/tickets');
const adminRoutes = require('./routes/admin');

// Initialize app
const app = express();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(cors());

// Database connection
require('./config/db')();

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/faqs', faqRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'API is healthy'
  });
});

// 404 Handler
app.all('*', (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server`
  });
});

// Error handler
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//yes
