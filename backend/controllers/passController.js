import Pass from '../models/passModel.js';
import Visitor from '../models/visitorModel.js';
import Appointment from '../models/appointmentModel.js';
import { generateQRCode } from '../utils/qrGenerator.js';
import { generatePassPdf } from '../utils/pdfGenerator.js';
import { sendEmail } from '../utils/emailService.js';
import { sendSms } from '../utils/smsService.js';

export const issuePass = async (req, res, next) => {
  try {
    const { visitorId, appointmentId, expiryDuration } = req.body;
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' });

    // Check if visitor is approved
    if (visitor.status !== 'approved') {
      return res.status(400).json({ message: 'Visitor must be approved before issuing pass' });
    }

    let appointment;
    if (appointmentId) {
      appointment = await Appointment.findById(appointmentId);
      if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
      
      // Check if appointment is approved
      if (appointment.status !== 'approved') {
        return res.status(400).json({ message: 'Appointment must be approved before issuing pass' });
      }
    }

    // Calculate expiration time
    const validFrom = new Date();
    const hours = expiryDuration || 24; // Default 24 hours
    const validUntil = new Date(validFrom.getTime() + hours * 60 * 60 * 1000);

    // Create pass first to get the ID
    const pass = await Pass.create({
      visitor: visitorId,
      appointment: appointmentId,
      qrCodeData: 'temporary',
      pdfPath: 'temporary',
      status: 'issued',
      validFrom,
      validUntil,
      expiryDuration: hours,
    });

    // Generate QR code with passId included
    const payload = { 
      visitorId, 
      passId: pass._id.toString(), 
      issuedAt: validFrom.getTime(), 
      validUntil: validUntil.getTime(),
      appointmentId,
      action: 'checkin',
      location: 'frontdesk'
    };
    
    const qrCodeData = await generateQRCode(JSON.stringify(payload));
    const relativePdfPath = await generatePassPdf({ 
      visitor, 
      qrCodeData, 
      pass,
      validFrom,
      validUntil 
    });
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const pdfPath = `${baseUrl}/uploads/${relativePdfPath}`;

    // Update pass with QR and PDF
    pass.qrCodeData = qrCodeData.toString('base64');
    pass.pdfPath = pdfPath;
    await pass.save();

    // Send email notification
    if (visitor.email) {
      await sendEmail({
        to: visitor.email,
        subject: 'Your Visitor Pass - Access Granted',
        text: `Dear ${visitor.fullName},\n\nYour digital visitor pass has been issued.\n\nValid From: ${validFrom.toLocaleString()}\nValid Until: ${validUntil.toLocaleString()}\n\nDownload your pass: ${pdfPath}\n\nPlease present this pass upon arrival.\n\nThank you!`,
      });
    }

    // Send SMS notification
    if (visitor.phone) {
      await sendSms({
        to: visitor.phone,
        body: `Your visitor pass has been issued. Valid until ${validUntil.toLocaleString()}. Download: ${pdfPath}`
      });
    }

    res.status(201).json(pass);
  } catch (err) {
    next(err);
  }
};

export const listPasses = async (_req, res, next) => {
  try {
    const passes = await Pass.find()
      .populate('visitor')
      .populate('appointment')
      .sort({ createdAt: -1 });
    
    // Check and update expired passes
    const updates = [];
    for (const pass of passes) {
      if (pass.checkExpiration()) {
        updates.push(pass.save());
      }
    }
    await Promise.all(updates);
    
    res.json(passes);
  } catch (err) {
    next(err);
  }
};

export const updatePassStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const pass = await Pass.findById(req.params.id);
    if (!pass) return res.status(404).json({ message: 'Pass not found' });
    
    // Don't allow changing status of expired passes unless revoking
    if (pass.isExpired && status !== 'revoked') {
      return res.status(400).json({ message: 'Cannot update expired pass. It can only be revoked.' });
    }
    
    pass.status = status;
    await pass.save();
    
    res.json(pass);
  } catch (err) {
    next(err);
  }
};

// Verify QR code and get pass details
export const verifyPass = async (req, res, next) => {
  try {
    const { passId } = req.body;
    const pass = await Pass.findById(passId).populate('visitor');
    
    if (!pass) {
      return res.status(404).json({ message: 'Pass not found' });
    }
    
    // Check expiration
    if (pass.checkExpiration()) {
      await pass.save();
      return res.status(403).json({ message: 'Pass has expired' });
    }
    
    if (pass.status === 'revoked') {
      return res.status(403).json({ message: 'Pass has been revoked' });
    }
    
    if (pass.status === 'expired') {
      return res.status(403).json({ message: 'Pass has expired' });
    }
    
    res.json({ 
      valid: true, 
      pass,
      visitor: pass.visitor,
      validUntil: pass.validUntil,
      remainingHours: Math.max(0, Math.floor((pass.validUntil - new Date()) / (1000 * 60 * 60)))
    });
  } catch (err) {
    next(err);
  }
};

// Get pass by ID
export const getPass = async (req, res, next) => {
  try {
    const pass = await Pass.findById(req.params.id)
      .populate('visitor')
      .populate('appointment');
    
    if (!pass) {
      return res.status(404).json({ message: 'Pass not found' });
    }
    
    // Check and update expiration
    if (pass.checkExpiration()) {
      await pass.save();
    }
    
    res.json(pass);
  } catch (err) {
    next(err);
  }
};

// Utility endpoint to expire all old passes (can be called by cron job)
export const expireOldPasses = async (_req, res, next) => {
  try {
    const expiredCount = await Pass.updateMany(
      { 
        validUntil: { $lt: new Date() },
        status: 'issued'
      },
      { status: 'expired' }
    );
    
    res.json({ 
      message: 'Expired passes updated',
      count: expiredCount.modifiedCount 
    });
  } catch (err) {
    next(err);
  }
};