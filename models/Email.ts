import mongoose from 'mongoose';

const EmailSchema = new mongoose.Schema({
  to: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['primary', 'promotions', 'updates', 'social'], 
    default: 'primary' 
  },
  status: { type: String, default: 'sent' },
  createdAt: { type: Date, default: Date.now }
});

export const Email = mongoose.models.Email || mongoose.model('Email', EmailSchema);