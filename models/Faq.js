const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please add a question'],
    unique: true
  },
  answer: {
    type: String,
    required: [true, 'Please add an answer']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['academic', 'administrative', 'technical', 'other']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FAQ', faqSchema);