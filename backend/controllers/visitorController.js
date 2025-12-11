import Visitor from '../models/visitorModel.js';

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate phone
const isValidPhone = (phone) => {
  // Accepts formats: +1234567890, 1234567890, (123)456-7890, etc.
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
};

export const createVisitor = async (req, res, next) => {
  try {
    const { fullName, email, phone, host, purpose } = req.body;
    
    // Validate required fields
    if (!fullName || fullName.trim() === '') {
      return res.status(400).json({ message: 'Full name is required' });
    }
    
    // Validate email if provided
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Validate phone if provided
    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }
    
    // Validate file if uploaded
    if (req.file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: 'Only JPEG, PNG, and GIF images are allowed' });
      }
      
      if (req.file.size > maxSize) {
        return res.status(400).json({ message: 'File size must be less than 5MB' });
      }
    }
    
    const photo = req.file ? `/uploads/${req.file.filename}` : undefined;
    const visitor = await Visitor.create({
      fullName: fullName.trim(),
      email: email?.trim(),
      phone: phone?.trim(),
      host: host?.trim(),
      purpose: purpose?.trim(),
      photo,
      createdBy: req.user?.id,
    });
    res.status(201).json(visitor);
  } catch (err) {
    next(err);
  }
};

export const listVisitors = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    let query = {};
    
    // Search by name, email, or phone
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    const visitors = await Visitor.find(query).sort({ createdAt: -1 });
    res.json(visitors);
  } catch (err) {
    next(err);
  }
};

export const getVisitor = async (req, res, next) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' });
    res.json(visitor);
  } catch (err) {
    next(err);
  }
};

export const updateVisitor = async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    
    // Validate email if provided
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Validate phone if provided
    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }
    
    // Validate file if uploaded
    if (req.file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: 'Only JPEG, PNG, and GIF images are allowed' });
      }
      
      if (req.file.size > maxSize) {
        return res.status(400).json({ message: 'File size must be less than 5MB' });
      }
    }
    
    const data = { ...req.body };
    if (req.file) data.photo = `/uploads/${req.file.filename}`;
    
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' });
    res.json(visitor);
  } catch (err) {
    next(err);
  }
};

export const deleteVisitor = async (req, res, next) => {
  try {
    const visitor = await Visitor.findByIdAndDelete(req.params.id);
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

// Public pre-registration (no auth required)
export const preRegisterVisitor = async (req, res, next) => {
  try {
    const { fullName, email, phone, host, purpose, appointmentDate } = req.body;
    
    // Validate required fields
    if (!fullName || fullName.trim() === '') {
      return res.status(400).json({ message: 'Full name is required' });
    }
    
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }
    
    if (!phone || !isValidPhone(phone)) {
      return res.status(400).json({ message: 'Valid phone number is required' });
    }
    
    if (!host || host.trim() === '') {
      return res.status(400).json({ message: 'Host name is required' });
    }
    
    if (!purpose || purpose.trim() === '') {
      return res.status(400).json({ message: 'Purpose of visit is required' });
    }
    
    // Validate file if uploaded
    if (req.file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: 'Only JPEG, PNG, and GIF images are allowed' });
      }
      
      if (req.file.size > maxSize) {
        return res.status(400).json({ message: 'File size must be less than 5MB' });
      }
    }
    
    const photo = req.file ? `/uploads/${req.file.filename}` : undefined;
    
    // Create visitor with pending status
    const visitor = await Visitor.create({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      host: host.trim(),
      purpose: purpose.trim(),
      photo,
      status: 'pending', // Needs approval
    });
    
    // Create appointment if date provided
    if (appointmentDate && host) {
      const Appointment = (await import('../models/appointmentModel.js')).default;
      await Appointment.create({
        visitor: visitor._id,
        hostName: host.trim(),
        scheduleAt: appointmentDate,
        status: 'scheduled',
        notes: 'Pre-registered by visitor'
      });
    }
    
    // Send confirmation email
    if (email) {
      const { sendEmail } = await import('../utils/emailService.js');
      await sendEmail({
        to: email,
        subject: 'Pre-Registration Received',
        text: `Thank you ${fullName}! Your visit request is pending approval. You will be notified once approved.`
      });
    }
    
    res.status(201).json({ 
      message: 'Pre-registration successful. Awaiting approval.',
      visitor 
    });
  } catch (err) {
    next(err);
  }
};