// import { Router } from "express";
// import authRoutes from "../modules/auth/auth.routes.js";

// const router = Router();

// router.use("/auth", authRoutes);

// export default router;

// // BACKEND/src/routes/index.js

const express = require('express');
const router = express.Router();

// ─── Module Routes ───────────────────────────────────
const authRoutes = require('../modules/auth/auth.routes');
// const principalRoutes = require('../modules/principals/principal.routes');
const teacherRoutes = require('../modules/teachers/teacher.routes');
const studentRoutes = require('../modules/students/student.routes');

// ─── API Version Prefix ─────────────────────────────
const API_V1 = '/api/v1';

// ─── Mount Routes ────────────────────────────────────
router.use(`${API_V1}/auth`, authRoutes);
// router.use(`${API_V1}/principals`, principalRoutes);
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

module.exports = router;