const jwt = require('jsonwebtoken');

/**
 * Generates a short-lived JWT access token (default: 15m).
 * @param {string} id - MongoDB User _id
 */
const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

/**
 * Generates a long-lived JWT refresh token (default: 7d).
 * @param {string} id - MongoDB User _id
 */
const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

/**
 * Sets the refresh token as an HTTP-only cookie and sends the access token
 * + user data in the response body.
 *
 * @param {object} user - Mongoose User document
 * @param {number} statusCode - HTTP response status code
 * @param {object} res - Express response object
 */
const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Cookie options
  const cookieOptions = {
    httpOnly: true,   // Prevents JS access (XSS protection)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(statusCode).json({
    success: true,
    accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
  });
};

module.exports = { generateAccessToken, generateRefreshToken, sendTokenResponse };
