// BACKEND/src/modules/classes/class.validation.js

import Joi from 'joi';

export const createClassSchema = Joi.object({
  name: Joi.string().required(),
  section: Joi.string().default('A'),
  gradeLevel: Joi.string().valid('PK','K','1','2','3','4','5','6','7','8','9','10','11','12').required(),
  districtId: Joi.string().required(),
  schoolId: Joi.string().required(),
  academicYear: Joi.string().required(),
  classTeacherId: Joi.string().allow(null, ''),
  roomNumber: Joi.string().allow('', null),
  capacity: Joi.number().min(1).default(30),
  schedule: Joi.object({
    startTime: Joi.string(),
    endTime: Joi.string(),
  }),
  status: Joi.string().valid('active', 'inactive', 'archived').default('active'),
});

export const updateClassSchema = Joi.object({
  name: Joi.string(),
  section: Joi.string(),
  gradeLevel: Joi.string().valid('PK','K','1','2','3','4','5','6','7','8','9','10','11','12'),
  classTeacherId: Joi.string().allow(null, ''),
  roomNumber: Joi.string().allow('', null),
  capacity: Joi.number().min(1),
  schedule: Joi.object({ startTime: Joi.string(), endTime: Joi.string() }),
  status: Joi.string().valid('active', 'inactive', 'archived'),
});

export const queryClassSchema = Joi.object({
  page: Joi.number().min(1),
  limit: Joi.number().min(1).max(100),
  status: Joi.string().valid('active', 'inactive', 'archived'),
  gradeLevel: Joi.string(),
  academicYear: Joi.string(),
  teacherId: Joi.string(),
  search: Joi.string(),
});
