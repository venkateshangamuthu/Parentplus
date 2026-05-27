import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'parentplus_secret_key_12345_secure_rand', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all required fields: name, email, password' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'parent',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isAvailable: user.isAvailable,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isAvailable: user.isAvailable,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
});

// @desc    Toggle caretaker availability
// @route   PUT /api/auth/availability
// @access  Private
router.put('/availability', protect, async (req, res) => {
  try {
    if (req.user.role !== 'caretaker') {
      return res.status(403).json({ message: 'Only accounts with Caretaker role can toggle availability' });
    }

    const { isAvailable } = req.body;
    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ message: 'Please specify a boolean isAvailable status' });
    }

    req.user.isAvailable = isAvailable;
    await req.user.save();

    res.json({
      _id: req.user._id,
      name: req.user.name,
      role: req.user.role,
      isAvailable: req.user.isAvailable,
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Server error updating availability status' });
  }
});

export default router;
