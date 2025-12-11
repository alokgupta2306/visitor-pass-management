import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    host: { type: String },
    purpose: { type: String },
    photo: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export default mongoose.model('Visitor', visitorSchema);


