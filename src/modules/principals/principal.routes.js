// BACKEND/src/modules/principals/principal.routes.js

import { Router } from 'express';
import principalController from './principal.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createPrincipalSchema,
  updatePrincipalSchema,
  queryPrincipalSchema,
} from './principal.validation.js';

const router = Router();

router.use(authenticate);

router.get('/me', authorize('school_admin', 'vice_principal'), principalController.getMyProfile);

router.post(
  '/',
  authorize('super_admin', 'district_admin'),
  validate(createPrincipalSchema),
  principalController.create
);

router.get(
  '/',
  authorize('super_admin', 'district_admin'),
  validate(queryPrincipalSchema, 'query'),
  principalController.getAll
);

router.get('/stats/:schoolId', authorize('super_admin', 'district_admin'), principalController.getStats);

router.get('/:id', authorize('super_admin', 'district_admin', 'school_admin'), principalController.getById);

router.put(
  '/:id',
  authorize('super_admin', 'district_admin'),
  validate(updatePrincipalSchema),
  principalController.update
);

router.patch('/:id/deactivate', authorize('super_admin', 'district_admin'), principalController.deactivate);

export default router;