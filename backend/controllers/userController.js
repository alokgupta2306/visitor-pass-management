import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';

// Get all users (Admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// Create new user (Admin only - can create admin/security)
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      role 
    });
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};

// Update user (Admin only)
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;
    
    const updateData = { name, email, role };
    
    // Only hash and update password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    next(err);
  }
};

// Delete user (Admin only)
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting yourself
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};