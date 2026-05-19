// BACKEND/src/modules/announcements/announcement.validation.js

import Joi from 'joi';

export const createAnnouncementSchema = Joi.object({
  title: Joi.string().max(200).required(),
  body: Joi.string().required(),
  districtId: Joi.string().required(),
  schoolId: Joi.string().required(),
  classId: Joi.string().allow(null, ''),
  subjectId: Joi.string().allow(null, ''),
  category: Joi.string().valid('general', 'assignment', 'exam', 'event', 'holiday', 'urgent', 'reminder').default('general'),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal'),
  audience: Joi.string().valid('class', 'school', 'district', 'all').default('class'),
  targetRoles: Joi.array().items(Joi.string()),
  publishAt: Joi.date().allow(null),
  expiresAt: Joi.date().allow(null),
  allowComments: Joi.boolean().default(true),
  allowReactions: Joi.boolean().default(true),
  attachments: Joi.array().items(
    Joi.object({
      fileName: Joi.string(),
      fileUrl: Joi.string().uri(),
      fileType: Joi.string(),
    })
  ),
});

export const updateAnnouncementSchema = Joi.object({
  title: Joi.string().max(200),
  body: Joi.string(),
  category: Joi.string().valid('general', 'assignment', 'exam', 'event', 'holiday', 'urgent', 'reminder'),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent'),
  audience: Joi.string().valid('class', 'school', 'district', 'all'),
  targetRoles: Joi.array().items(Joi.string()),
  expiresAt: Joi.date().allow(null),
  allowComments: Joi.boolean(),
  allowReactions: Joi.boolean(),
  status: Joi.string().valid('draft', 'published', 'archived'),
  attachments: Joi.array().items(
    Joi.object({
      fileName: Joi.string(),
      fileUrl: Joi.string().uri(),
      fileType: Joi.string(),
    })
  ),
});

export const queryAnnouncementSchema = Joi.object({
  page: Joi.number().min(1),
  limit: Joi.number().min(1).max(100),
  classId: Joi.string(),
  category: Joi.string(),
  priority: Joi.string(),
  status: Joi.string().valid('draft', 'published', 'archived'),
  audience: Joi.string(),
  isPinned: Joi.boolean(),
  search: Joi.string(),
});
