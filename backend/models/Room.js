import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  number: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  capacity: { type: String, required: true },
  bedType: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Available', 'Booked', 'Blocked', 'Maintenance'],
    default: 'Available' 
  },
  currentGuest: { type: String, default: null },
  nextAvailable: { type: String, default: 'Immediate' },
  amenities: [{ type: String }],
  cbsIcalUrl: { type: String }
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);
