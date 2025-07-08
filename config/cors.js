const cors = require('cors');
const { FRONTEND_URL } = process.env;

module.exports = cors({
  origin: [
    FRONTEND_URL,
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});