import { Router } from 'express';
import teacherController from './teacher.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createTeacherSchema,
  updateTeacherSchema,
  assignClassSchema,
  queryTeacherSchema,
} from './teacher.validation.js';

const router = Router();

router.use(authenticate);

router.get('/me', authorize('teacher', 'teaching_assistant'), teacherController.getMyProfile);

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

router.patch(
  '/:id/deactivate',
  authorize('super_admin', 'district_admin', 'school_admin'),
  teacherController.deactivate
);

export default router;