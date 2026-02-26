// BACKEND/src/routes/index.js

import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import principalRoutes from '../modules/principals/principal.routes.js';
import teacherRoutes from '../modules/teachers/teacher.routes.js';
import studentRoutes from '../modules/students/student.routes.js';

const router = Router();

const API_V1 = '/api/v1';

// ─── Mount Routes ────────────────────────────────────
router.use(`${API_V1}/auth`, authRoutes);
router.use(`${API_V1}/principals`, principalRoutes);
router.use(`${API_V1}/teachers`, teacherRoutes);
router.use(`${API_V1}/students`, studentRoutes);

// ─── Health Check ────────────────────────────────────
router.get(`${API_V1}/health`, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Character360 API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

export default router;