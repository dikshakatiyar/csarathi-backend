const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  status: { 
    type: String, 
    enum: ['open', 'in-progress', 'resolved'], 
    default: 'open'
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium'
  },
  response: { 
    type: String, 
    default: '',
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);