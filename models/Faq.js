const mongoose = require('mongoose');

const FaqSchema = new mongoose.Schema({
  question: { 
    type: String, 
    required: true,
    trim: true
  },
  answer: { 
    type: String, 
    required: true,
    trim: true
  },
  category: { 
    type: String, 
    default: 'General',
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Faq', FaqSchema);