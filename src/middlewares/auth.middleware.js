// BACKEND/src/middlewares/auth.middleware.js

import jwt from 'jsonwebtoken';
import User from '../modules/users/user.model.js';
import { sendError } from '../utils/response.js';

/**
 * Authenticate user via JWT token
 * Attaches full user object to req.user (with methods like hasRole)
 */
export const authenticate = async (req, res, next) => {
  try {
    // 1. Extract token
    let token = null;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 401, 'Access denied. No token provided.');
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Token has expired. Please login again.');
      }
      return sendError(res, 401, 'Invalid token.');
    }

    // 3. Find user and attach to request
    const user = await User.findById(decoded.id || decoded._id)
      .select('+password'); // We might need password for changedPasswordAfter check

    if (!user) {
      return sendError(res, 401, 'User no longer exists.');
    }

    // 4. Check if user is active
    if (user.status !== 'active') {
      return sendError(res, 403, `Account is ${user.status}. Contact administrator.`);
    }

    // 5. Check if password was changed after token was issued
    if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
      return sendError(res, 401, 'Password recently changed. Please login again.');
    }

    // 6. Remove password from user object before attaching
    user.password = undefined;

    // 7. Attach user to request
    req.user = user;

    next();
  } catch (error) {
    return sendError(res, 500, 'Authentication error.');
  }
};

/**
 * Optional: Lightweight auth (just decode token, don't fetch user from DB)
 * Use for non-critical routes where you just need user ID
 */
export const authenticateLight = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return sendError(res, 401, 'Access denied. No token provided.');
    }

    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return sendError(res, 401, 'Invalid token.');
    }

    next();
  } catch (error) {
    return sendError(res, 500, 'Authentication error.');
  }
};

// Also export as default for backward compatibility
export default authenticate;