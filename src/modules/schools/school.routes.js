// BACKEND/src/modules/schools/school.routes.js

import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createSchoolSchema,
  updateSchoolSchema,
  querySchoolSchema,
} from './school.validation.js';
import schoolController from './school.controller.js';

const router = Router();

router.use(authenticate);

router
  .route('/')
  .post(
    authorize('super_admin', 'district_admin'),
    validate(createSchoolSchema),
    schoolController.create.bind(schoolController)
  )
  .get(
    authorize('super_admin', 'district_admin', 'school_admin'),
    validate(querySchoolSchema, 'query'),
    schoolController.getAll.bind(schoolController)
  );

router
  .route('/:id')
  .get(
    authorize('super_admin', 'district_admin', 'school_admin'),
    schoolController.getById.bind(schoolController)
  )
  .put(
    authorize('super_admin', 'district_admin'),
    validate(updateSchoolSchema),
    schoolController.update.bind(schoolController)
  )
  .delete(
    authorize('super_admin'),
    schoolController.delete.bind(schoolController)
  );

export default router;
