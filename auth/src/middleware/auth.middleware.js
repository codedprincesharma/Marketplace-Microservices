const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');


async function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthenticatio' });
  }
  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = decoded
    req.user = user;
    next();

  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}


module.exports = { authMiddleware };