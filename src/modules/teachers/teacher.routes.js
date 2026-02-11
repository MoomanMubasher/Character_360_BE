const express = require('express');
const router = express.Router();
const teacherController = require('./teacher.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const {
  createTeacherSchema,
  updateTeacherSchema,
  assignClassSchema,
  queryTeacherSchema,
} = require('./teacher.validation');

router.use(authenticate);

// ─── Teacher's Own Profile ───────────────────────────
router.get(
  '/me',
  authorize('teacher', 'teaching_assistant'),
  teacherController.getMyProfile
);

// ─── CRUD Operations ─────────────────────────────────
router.post(
  '/',
  authorize('super_admin', 'district_admin', 'school_admin'),
  validate(createTeacherSchema),
  teacherController.create
);

router.get(
  '/',
  authorize('super_admin', 'district_admin', 'school_admin', 'vice_principal'),
  validate(queryTeacherSchema, 'query'),
  teacherController.getAll
);

router.get(
  '/school/:schoolId',
  authorize('super_admin', 'district_admin', 'school_admin', 'vice_principal'),
  teacherController.getBySchool
);

router.get(
  '/stats/:schoolId',
  authorize('super_admin', 'district_admin', 'school_admin'),
  teacherController.getStats
);

router.get(
  '/:id',
  authorize('super_admin', 'district_admin', 'school_admin', 'vice_principal'),
  teacherController.getById
);

router.put(
  '/:id',
  authorize('super_admin', 'district_admin', 'school_admin'),
  validate(updateTeacherSchema),
  teacherController.update
);

// ─── Class Assignment ────────────────────────────────
router.post(
  '/:id/assign-class',
  authorize('super_admin', 'district_admin', 'school_admin'),
  validate(assignClassSchema),
  teacherController.assignClass
);

router.delete(
  '/:id/remove-class/:classId',
  authorize('super_admin', 'district_admin', 'school_admin'),
  teacherController.removeClass
);

// ─── Deactivate ──────────────────────────────────────
router.patch(
  '/:id/deactivate',
  authorize('super_admin', 'district_admin', 'school_admin'),
  teacherController.deactivate
);

module.exports = router;