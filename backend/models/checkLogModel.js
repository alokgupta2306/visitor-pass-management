import mongoose from 'mongoose';

const checkLogSchema = new mongoose.Schema(
  {
    visitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor', required: true },
    pass: { type: mongoose.Schema.Types.ObjectId, ref: 'Pass' },
    action: { type: String, enum: ['checkin', 'checkout'], required: true },
    location: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model('CheckLog', checkLogSchema);


