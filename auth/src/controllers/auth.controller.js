const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const redis = require('../db/redis');

async function registerController(req, res) {
  try {
    const { username, email, password, fullName } = req.body;
    if (!username || !email || !password || !fullName?.firstName || !fullName?.lastName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check existing user by username OR email
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      fullName: { firstName: fullName.firstName, lastName: fullName.lastName }
    });
    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Send cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // only true in production
      maxAge: 24 * 60 * 60 * 1000
    });

    // Send response
    res.status(201).json({
      message: 'User registered successfully',
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      address: user.address
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function loginController(req, res) {
  try {
    const { email, password, username } = req.body;
    if (!email && !username || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user and include password
    const user = await User.findOne({
      $or: [{ username }, { email }]
    }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Login successful',
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.status(200).json(user)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}


async function logoutController(req, res) {
  try {
    const token = req.cookies && req.cookies.token;
    if (token) {
      // Optionally, you can blacklist the token in Redis to invalidate it before its expiry
      await redis.set(`blacklist_${token}`, 'true', 'EX', 24 * 60 * 60); // expire in 1 day
    }

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });

    return res.status(200).json({ message: 'Logged out' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { registerController, loginController, getCurrentUser, logoutController };