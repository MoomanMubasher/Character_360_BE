// BACKEND/src/modules/announcements/announcement.routes.js

import { Router } from 'express';
import announcementController from './announcement.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  queryAnnouncementSchema,
} from './announcement.validation.js';

const router = Router();

router.use(authenticate);

const ALL_ROLES = [
  'teacher', 'teaching_assistant', 'school_admin', 'vice_principal',
  'district_admin', 'district_superintendent', 'super_admin',
  'student', 'parent', 'counselor',
];
const WRITE_ROLES = [
  'teacher', 'teaching_assistant', 'school_admin', 'vice_principal',
  'district_admin', 'district_superintendent', 'super_admin',
];
const ADMIN_ROLES = ['school_admin', 'vice_principal', 'district_admin', 'district_superintendent', 'super_admin'];

router.get('/', authorize(...ALL_ROLES), validate(queryAnnouncementSchema, 'query'), announcementController.getAll);
router.get('/:id', authorize(...ALL_ROLES), announcementController.getById);
router.post('/', authorize(...WRITE_ROLES), validate(createAnnouncementSchema), announcementController.create);
router.put('/:id', authorize(...WRITE_ROLES), validate(updateAnnouncementSchema), announcementController.update);
router.delete('/:id', authorize(...WRITE_ROLES), announcementController.delete);
router.patch('/:id/pin', authorize(...ADMIN_ROLES), announcementController.pin);
router.patch('/:id/unpin', authorize(...ADMIN_ROLES), announcementController.unpin);
router.patch('/:id/archive', authorize(...ADMIN_ROLES), announcementController.archive);

export default router;
