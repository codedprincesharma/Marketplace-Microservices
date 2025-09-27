const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

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

module.exports = { registerController };