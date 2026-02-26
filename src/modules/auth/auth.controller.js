// BACKEND/src/modules/auth/auth.controller.js

import authService from './auth.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

class AuthController {
  /**
   * POST /api/v1/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return sendError(res, 400, 'Email and password are required');
      }

      const result = await authService.login(email, password);

      return sendSuccess(res, 200, 'Login successful', {
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.statusCode, error.message);
      }
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  async getMe(req, res, next) {
    try {
      const user = await authService.getMe(req.user._id);

      return sendSuccess(res, 200, 'User profile fetched', user);
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.statusCode, error.message);
      }
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return sendError(res, 400, 'Email is required');
      }

      const result = await authService.forgotPassword(email);

      return sendSuccess(res, 200, result.message);
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.statusCode, error.message);
      }
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return sendError(res, 400, 'Token and new password are required');
      }

      const result = await authService.resetPassword(token, password);

      return sendSuccess(res, 200, result.message);
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.statusCode, error.message);
      }
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/refresh-token
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return sendError(res, 400, 'Refresh token is required');
      }

      const result = await authService.refreshToken(refreshToken);

      return sendSuccess(res, 200, 'Token refreshed', result);
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.statusCode, error.message);
      }
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/change-password
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return sendError(res, 400, 'Current and new password are required');
      }

      const result = await authService.changePassword(
        req.user._id,
        currentPassword,
        newPassword
      );

      return sendSuccess(res, 200, result.message);
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.statusCode, error.message);
      }
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  async logout(req, res) {
    // For JWT, logout is handled client-side by removing the token
    // If using refresh tokens in DB, invalidate here
    return sendSuccess(res, 200, 'Logged out successfully');
  }
}

export default new AuthController();