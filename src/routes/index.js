// BACKEND/src/routes/index.js

import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import principalRoutes from '../modules/principals/principal.routes.js';
import teacherRoutes from '../modules/teachers/teacher.routes.js';
import studentRoutes from '../modules/students/student.routes.js';
import academicYearRoutes from '../modules/academic/academic-years/academicYear.routes.js';
import countryRoutes from '../modules/countries/country.routes.js';
import stateRoutes from '../modules/states/state.routes.js';
import countyRoutes from '../modules/counties/county.routes.js';
import districtRoutes from '../modules/districts/district.routes.js';
import schoolRoutes from '../modules/schools/school.routes.js';
import brandingRoutes from '../modules/branding/branding.routes.js';

const router = Router();

const API_V1 = '/api/v1';

// ─── Mount Routes ────────────────────────────────────
router.use(`${API_V1}/auth`, authRoutes);
router.use(`${API_V1}/branding`, brandingRoutes);
router.use(`${API_V1}/principals`, principalRoutes);
router.use(`${API_V1}/teachers`, teacherRoutes);
router.use(`${API_V1}/students`, studentRoutes);
router.use(`${API_V1}/academic-years`, academicYearRoutes);
router.use(`${API_V1}/countries`, countryRoutes);
router.use(`${API_V1}/states`, stateRoutes);
router.use(`${API_V1}/counties`, countyRoutes);
router.use(`${API_V1}/districts`, districtRoutes);
router.use(`${API_V1}/schools`, schoolRoutes);

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