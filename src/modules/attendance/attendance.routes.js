// BACKEND/src/modules/attendance/attendance.routes.js

import { Router } from 'express';
import attendanceController from './attendance.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';

const router = Router();

router.use(authenticate);

const ATTENDANCE_ROLES = ['teacher', 'teaching_assistant', 'school_admin', 'vice_principal', 'district_admin', 'district_superintendent', 'super_admin'];

// Teacher: overview of their classes' attendance (for AllAttendances page)
router.get('/overview', authorize('teacher', 'teaching_assistant'), attendanceController.getTeacherOverview);

// List attendance records with filters
router.get('/', authorize(...ATTENDANCE_ROLES), attendanceController.getAll);

// Get/create today's sheet for a class
router.get('/class/:classId/sheet', authorize(...ATTENDANCE_ROLES), attendanceController.getOrCreateSheet);

// Get attendance for a class on a specific date
router.get('/class/:classId', authorize(...ATTENDANCE_ROLES), attendanceController.getClassSheet);

// Save full attendance for a class
router.post('/class/:classId/save', authorize(...ATTENDANCE_ROLES), attendanceController.saveAttendance);

// Update a remark for a single student
router.patch('/:attendanceId/student/:studentId/remark', authorize(...ATTENDANCE_ROLES), attendanceController.updateRemark);

// Finalize/lock attendance
router.patch('/:id/finalize', authorize('school_admin', 'vice_principal', 'district_admin', 'super_admin'), attendanceController.finalizeAttendance);

export default router;
