const express = require('express');
const router = express.Router();
const studentController = require('./student.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const {
  createStudentSchema,
  updateStudentSchema,
  transferStudentSchema,
  withdrawStudentSchema,
  queryStudentSchema,
} = require('./student.validation');

router.use(authenticate);

// ─── Student's Own Profile ───────────────────────────
router.get(
  '/me',
  authorize('student'),
  studentController.getMyProfile
);

// ─── Stats ───────────────────────────────────────────
router.get(
  '/stats',
  authorize('super_admin', 'district_admin', 'school_admin', 'vice_principal'),
  studentController.getStats
);

// ─── CRUD Operations ─────────────────────────────────
router.post(
  '/',
  authorize('super_admin', 'district_admin', 'school_admin', 'vice_principal', 'office_admin'),
  validate(createStudentSchema),
  studentController.create
);

router.get(
  '/',
  authorize(
    'super_admin', 'district_admin', 'school_admin',
    'vice_principal', 'office_admin', 'teacher',
    'counselor'
  ),
  validate(queryStudentSchema, 'query'),
  studentController.getAll
);

router.get(
  '/:id',
  authorize(
    'super_admin', 'district_admin', 'school_admin',
    'vice_principal', 'office_admin', 'teacher',
    'counselor'
  ),
  studentController.getById
);

router.put(
  '/:id',
  authorize('super_admin', 'district_admin', 'school_admin', 'vice_principal', 'office_admin'),
  validate(updateStudentSchema),
  studentController.update
);

// ─── Enrollment Actions ─────────────────────────────
router.patch(
  '/:id/approve',
  authorize('super_admin', 'district_admin', 'school_admin'),
  studentController.approveEnrollment
);

router.patch(
  '/:id/transfer',
  authorize('super_admin', 'district_admin'),
  validate(transferStudentSchema),
  studentController.transfer
);

router.patch(
  '/:id/withdraw',
  authorize('super_admin', 'district_admin', 'school_admin'),
  validate(withdrawStudentSchema),
  studentController.withdraw
);

module.exports = router;