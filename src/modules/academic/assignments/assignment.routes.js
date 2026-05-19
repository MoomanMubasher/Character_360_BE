// BACKEND/src/modules/academic/assignments/assignment.routes.js

import { Router } from 'express';
import assignmentController from './assignment.controller.js';
import { authenticate } from '../../../middlewares/auth.middleware.js';
import { authorize } from '../../../middlewares/rbac.middleware.js';

const router = Router();

router.use(authenticate);

const WRITE_ROLES = ['teacher', 'teaching_assistant', 'school_admin', 'vice_principal', 'district_admin', 'super_admin'];
const READ_ROLES = [...WRITE_ROLES, 'student', 'parent'];

router.get('/', authorize(...READ_ROLES), assignmentController.getAll);
router.get('/:id', authorize(...READ_ROLES), assignmentController.getById);
router.post('/', authorize(...WRITE_ROLES), assignmentController.create);
router.put('/:id', authorize(...WRITE_ROLES), assignmentController.update);
router.delete('/:id', authorize(...WRITE_ROLES), assignmentController.delete);
router.patch('/:id/publish', authorize(...WRITE_ROLES), assignmentController.publish);

export default router;
