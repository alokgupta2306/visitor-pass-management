import Appointment from '../models/appointmentModel.js';
import Visitor from '../models/visitorModel.js';
import { sendEmail } from '../utils/emailService.js';
import { sendSms } from '../utils/smsService.js';

export const createAppointment = async (req, res, next) => {
  try {
    const { visitorId, hostName, hostEmail, hostDepartment, scheduleAt, notes } = req.body;
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' });

    const appointment = await Appointment.create({
      visitor: visitorId,
      hostName,
      hostEmail,
      hostDepartment,
      scheduleAt,
      notes,
      status: 'scheduled', // Always starts as scheduled
      createdBy: req.user?.id,
    });

    // Send email to visitor
    if (visitor.email) {
      await sendEmail({
        to: visitor.email,
        subject: 'Appointment Scheduled - Awaiting Approval',
        text: `Dear ${visitor.fullName},\n\nYour appointment with ${hostName} has been scheduled for ${new Date(scheduleAt).toLocaleString()}.\n\nYour appointment is awaiting approval from the host.\n\nThank you!`
      });
    }

    // Send email to host for approval
    if (hostEmail) {
      await sendEmail({
        to: hostEmail,
        subject: 'New Appointment Request - Action Required',
        text: `Hello ${hostName},\n\n${visitor.fullName} has requested an appointment with you on ${new Date(scheduleAt).toLocaleString()}.\n\nPurpose: ${visitor.purpose || 'Not specified'}\nNotes: ${notes || 'None'}\n\nPlease log in to the system to approve or decline this appointment.\n\nThank you!`
      });
    }

    // Send SMS to visitor
    if (visitor.phone) {
      await sendSms({
        to: visitor.phone,
        body: `Appointment with ${hostName} scheduled for ${new Date(scheduleAt).toLocaleString()}. Awaiting approval.`
      });
    }

    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
};

export const listAppointments = async (_req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate('visitor')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ scheduleAt: -1 });
    res.json(appointments);
  } catch (err) {
    next(err);
  }
};

export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, notes, declinedReason } = req.body;
    
    const updateData = { status, notes };
    
    // Track approval/decline
    if (status === 'approved') {
      updateData.approvedBy = req.user.id;
      updateData.approvedAt = new Date();
    } else if (status === 'declined') {
      updateData.declinedReason = declinedReason;
    }
    
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    ).populate('visitor');
    
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    const visitor = appointment.visitor;
    
    // Send notification to visitor
    if (status === 'approved' && visitor.email) {
      await sendEmail({
        to: visitor.email,
        subject: 'Appointment Approved ✅',
        text: `Dear ${visitor.fullName},\n\nGood news! Your appointment with ${appointment.hostName} on ${new Date(appointment.scheduleAt).toLocaleString()} has been approved.\n\nYou can now obtain your visitor pass.\n\nThank you!`
      });
      
      if (visitor.phone) {
        await sendSms({
          to: visitor.phone,
          body: `Appointment approved! Visit ${appointment.hostName} on ${new Date(appointment.scheduleAt).toLocaleString()}`
        });
      }
    }
    
    if (status === 'declined' && visitor.email) {
      await sendEmail({
        to: visitor.email,
        subject: 'Appointment Declined',
        text: `Dear ${visitor.fullName},\n\nWe regret to inform you that your appointment with ${appointment.hostName} on ${new Date(appointment.scheduleAt).toLocaleString()} has been declined.\n\nReason: ${declinedReason || 'Not specified'}\n\nPlease contact ${appointment.hostName} for more information.\n\nThank you!`
      });
      
      if (visitor.phone) {
        await sendSms({
          to: visitor.phone,
          body: `Appointment with ${appointment.hostName} has been declined. Reason: ${declinedReason || 'Not specified'}`
        });
      }
    }
    
    res.json(appointment);
  } catch (err) {
    next(err);
  }
};

// Get appointment by ID
export const getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('visitor')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json(appointment);
  } catch (err) {
    next(err);
  }
};