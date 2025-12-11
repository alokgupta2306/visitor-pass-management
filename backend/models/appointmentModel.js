import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    visitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor', required: true },
    hostName: { type: String, required: true },
    hostEmail: { type: String }, // Host email for notifications
    hostDepartment: { type: String },
    scheduleAt: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ['scheduled', 'approved', 'declined', 'completed', 'cancelled'], 
      default: 'scheduled' 
    },
    notes: { type: String },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    declinedReason: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export default mongoose.model('Appointment', appointmentSchema);