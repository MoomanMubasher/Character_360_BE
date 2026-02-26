// BACKEND/src/modules/auth/auth.service.js

import User from '../users/user.model.js';
import jwt from 'jsonwebtoken';

class AuthService {
  /**
   * Generate JWT Token
   */
  generateToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        roles: user.roles,
        primaryRole: user.primaryRole,
        districtId: user.districtId,
        schoolId: user.schoolId,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  /**
   * Generate Refresh Token
   */
  generateRefreshToken(user) {
    return jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );
  }

  /**
   * Login
   */
  async login(email, password) {
    // 1. Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    // 2. Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    // 3. Check account status
    if (user.status !== 'active') {
      throw {
        statusCode: 403,
        message: `Your account is ${user.status}. Please contact administrator.`,
      };
    }

    // 4. Update last login
    user.lastLogin = new Date();
    await user.save();

    // 5. Generate tokens
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // 6. Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return {
      user: userResponse,
      token,
      refreshToken,
    };
  }

  /**
   * Get current user profile
   */
  async getMe(userId) {
    const user = await User.findById(userId)
      .populate('districtId', 'name code')
      .populate('schoolId', 'name code');

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    return user;
  }

  /**
   * Forgot Password
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists or not (security)
      return { message: 'If this email exists, a reset link has been sent.' };
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Save hashed token to DB
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // TODO: Send email with reset link
    // const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    // await emailService.sendPasswordReset(user.email, resetUrl);

    console.log(`Password reset token for ${email}: ${resetToken}`);

    return { message: 'If this email exists, a reset link has been sent.' };
  }

  /**
   * Reset Password
   */
  async resetPassword(token, newPassword) {
    // 1. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw { statusCode: 400, message: 'Invalid or expired reset token' };
    }

    // 2. Find user
    const user = await User.findById(decoded.id).select(
      '+passwordResetToken +passwordResetExpires'
    );

    if (!user) {
      throw { statusCode: 400, message: 'Invalid reset token' };
    }

    // 3. Check if token matches and hasn't expired
    if (
      user.passwordResetToken !== token ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date()
    ) {
      throw { statusCode: 400, message: 'Reset token has expired. Please request a new one.' };
    }

    // 4. Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = new Date();
    await user.save();

    return { message: 'Password reset successfully' };
  }

  /**
   * Refresh Token
   */
  async refreshToken(token) {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw { statusCode: 401, message: 'Invalid or expired refresh token' };
    }

    const user = await User.findById(decoded.id);

    if (!user || user.status !== 'active') {
      throw { statusCode: 401, message: 'User not found or inactive' };
    }

    const newToken = this.generateToken(user);
    const newRefreshToken = this.generateRefreshToken(user);

    return {
      token: newToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Change Password (while logged in)
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      throw { statusCode: 401, message: 'Current password is incorrect' };
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    return { message: 'Password changed successfully' };
  }
}

export default new AuthService();