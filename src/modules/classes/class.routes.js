// BACKEND/src/modules/classes/class.routes.js

import { Router } from 'express';
import classController from './class.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createClassSchema, updateClassSchema, queryClassSchema } from './class.validation.js';

const router = Router();

router.use(authenticate);

// Teacher: get own classes
router.get(
  '/me',
  authorize('teacher', 'teaching_assistant'),
  classController.getMyClasses
);

// Admin: list all classes
router.get(
  '/',
  authorize('super_admin', 'district_admin', 'district_superintendent', 'school_admin', 'vice_principal', 'teacher', 'teaching_assistant'),
  validate(queryClassSchema, 'query'),
  classController.getAll
);

router.get(
  '/:id',
  authorize('super_admin', 'district_admin', 'district_superintendent', 'school_admin', 'vice_principal', 'teacher', 'teaching_assistant'),
  classController.getById
);

router.post(
  '/',
  authorize('super_admin', 'district_admin', 'school_admin', 'vice_principal'),
  validate(createClassSchema),
  classController.create
);

router.put(
  '/:id',
  authorize('super_admin', 'district_admin', 'school_admin', 'vice_principal'),
  validate(updateClassSchema),
  classController.update
);

router.delete(
  '/:id',
  authorize('super_admin', 'district_admin', 'school_admin'),
  classController.delete
);

export default router;
