import { Router } from 'express';
import studentController from './student.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createStudentSchema,
  updateStudentSchema,
  transferStudentSchema,
  withdrawStudentSchema,
  queryStudentSchema,
} from './student.validation.js';

const router = Router();

router.use(authenticate);

router.get('/me', authorize('student'), studentController.getMyProfile);

router.get(
  '/stats',
  authorize('super_admin', 'district_admin', 'school_admin', 'vice_principal'),
  studentController.getStats
);

router.post(
  '/',
  authorize('super_admin', 'district_admin', 'school_admin', 'vice_principal', 'office_admin'),
  validate(createStudentSchema),
  studentController.create
);

router.get(
  '/',
  authorize('super_admin', 'district_admin', 'school_admin', 'vice_principal', 'office_admin', 'teacher', 'counselor'),
  validate(queryStudentSchema, 'query'),
  studentController.getAll
);

router.get(
  '/:id',
  authorize('super_admin', 'district_admin', 'school_admin', 'vice_principal', 'office_admin', 'teacher', 'counselor'),
  studentController.getById
);

router.put(
  '/:id',
  authorize('super_admin', 'district_admin', 'school_admin', 'vice_principal', 'office_admin'),
  validate(updateStudentSchema),
  studentController.update
);

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

export default router;