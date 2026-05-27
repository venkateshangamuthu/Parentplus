import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['Hospital Visit Assistance', 'Medicine Management', 'Routine Checkup'],
  },
  location: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'completed', 'cancelled'],
    default: 'pending',
  },
  caretakerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  caretakerName: {
    type: String,
    default: '',
  },
  prescriptionText: {
    type: String,
    default: '',
  },
  visitSummary: {
    type: String,
    default: '',
  },
  estimatedCost: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Booking', bookingSchema);
