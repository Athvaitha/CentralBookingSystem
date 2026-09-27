import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  roomNumber: { type: String, required: true },
  roomId: { type: String, default: '' },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Blocked', 'Maintenance'],
    default: 'Blocked' 
  },
  reason: { type: String, default: '' },
  createdBy: { type: String, default: 'Admin' }
}, { timestamps: true });

export default mongoose.model('Block', blockSchema);
