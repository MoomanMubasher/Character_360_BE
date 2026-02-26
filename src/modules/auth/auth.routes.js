// BACKEND/src/modules/auth/auth.routes.js

import { Router } from 'express';
import authController from './auth.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema,
} from './auth.validation.js';

const router = Router();

// ─── Public Routes ───────────────────────────────────
router.post('/login', validate(loginSchema), authController.login);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);

// ─── Protected Routes ────────────────────────────────
router.get('/me', authenticate, authController.getMe);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.post('/logout', authenticate, authController.logout);

export default router;