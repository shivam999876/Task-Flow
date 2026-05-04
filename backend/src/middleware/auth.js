const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware: Verifies the JWT access token from the Authorization header.
 * Expects: Authorization: Bearer <token>
 * Attaches the authenticated user document to req.user on success.
 */
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    // Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB (ensures account still exists and is active)
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message, "Token received:", req.headers.authorization);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please refresh.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    next(err);
  }
};

module.exports = { authenticate };
