import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/userModel.js';
import Visitor from './models/visitorModel.js';
import Appointment from './models/appointmentModel.js';
import Pass from './models/passModel.js';
import CheckLog from './models/checkLogModel.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Visitor.deleteMany({});
    await Appointment.deleteMany({});
    await Pass.deleteMany({});
    await CheckLog.deleteMany({});

    // Create users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const securityPassword = await bcrypt.hash('security123', 10);
    const employeePassword = await bcrypt.hash('employee123', 10);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
    });

    const security = await User.create({
      name: 'Security Officer',
      email: 'security@example.com',
      password: securityPassword,
      role: 'security',
    });

    const employee = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: employeePassword,
      role: 'employee',
    });

    console.log('✓ Users created');

    // Create visitors
    const visitor1 = await Visitor.create({
      fullName: 'Alice Smith',
      email: 'alice@example.com',
      phone: '9876543210',
      host: 'John Doe',
      purpose: 'Business Meeting',
      status: 'approved',
      createdBy: employee._id,
    });

    const visitor2 = await Visitor.create({
      fullName: 'Bob Johnson',
      email: 'bob@example.com',
      phone: '9123456789',
      host: 'Manager',
      purpose: 'Interview',
      status: 'pending',
      createdBy: employee._id,
    });

    console.log('✓ Visitors created');

    // Create appointments
    const appointment1 = await Appointment.create({
      visitor: visitor1._id,
      hostName: 'John Doe',
      hostDepartment: 'Engineering',
      scheduleAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'approved',
      notes: 'Project discussion',
    });

    console.log('✓ Appointments created');

    // Create passes
    const pass1 = await Pass.create({
      visitor: visitor1._id,
      appointment: appointment1._id,
      qrCodeData: 'QR_CODE_DATA_1',
      pdfPath: '/uploads/passes/pass-sample.pdf',
      status: 'issued',
    });

    console.log('✓ Passes created');

    // Create check logs
    await CheckLog.create({
      visitor: visitor1._id,
      pass: pass1._id,
      action: 'checkin',
      location: 'Main Entrance',
      timestamp: new Date(),
    });

    console.log('✓ Check logs created');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Security: security@example.com / security123');
    console.log('Employee: john@example.com / employee123');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();