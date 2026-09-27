import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  guestName: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  roomNumber: { type: String, required: true },
  roomType: { type: String, default: '' },
  checkIn: { type: String, required: true },
  checkOut: { type: String, required: true },
  nights: { type: Number, default: 1 },
  adults: { type: Number, default: 1 },
  children: { type: Number, default: 0 },
  source: { 
    type: String, 
    default: 'Manual / Walk-in' 
  },
  status: { 
    type: String, 
    enum: ['Confirmed', 'Pending', 'Cancelled', 'Conflict'],
    default: 'Confirmed' 
  },
  totalAmount: { type: mongoose.Schema.Types.Mixed, default: 0 },
  paymentStatus: { type: String, default: 'Paid' },
  createdAtStr: { type: String, default: () => new Date().toLocaleString('en-IN') },
  notes: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
