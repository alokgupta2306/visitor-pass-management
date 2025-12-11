import mongoose from 'mongoose';

const passSchema = new mongoose.Schema(
  {
    visitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    qrCodeData: { type: String },
    pdfPath: { type: String },
    status: { type: String, enum: ['issued', 'revoked', 'expired'], default: 'issued' },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
    expiryDuration: { type: Number, default: 24 }, // hours
  },
  { timestamps: true },
);

// Virtual to check if pass is expired
passSchema.virtual('isExpired').get(function() {
  return this.validUntil < new Date();
});

// Method to check and update expiration status
passSchema.methods.checkExpiration = function() {
  if (this.isExpired && this.status === 'issued') {
    this.status = 'expired';
    return true;
  }
  return false;
};

// Ensure virtuals are included in JSON
passSchema.set('toJSON', { virtuals: true });
passSchema.set('toObject', { virtuals: true });

export default mongoose.model('Pass', passSchema);