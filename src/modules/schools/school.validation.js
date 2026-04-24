// BACKEND/src/modules/schools/school.validation.js

import Joi from 'joi';

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

export const createSchoolSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required().messages({
    'string.empty': 'School name is required',
    'any.required': 'School name is required',
  }),
  code: Joi.string().trim().min(1).max(20).uppercase().required().messages({
    'string.empty': 'School code is required',
    'any.required': 'School code is required',
  }),
  description: Joi.string().trim().max(1000),
  district_id: objectId.required().messages({
    'string.pattern.base': 'Invalid district ID',
    'any.required': 'District is required',
  }),
  type: Joi.string()
    .valid('elementary', 'middle', 'high', 'k8', 'k12', 'alternative', 'charter')
    .required(),
  grade_levels: Joi.array().items(
    Joi.string().valid('PK', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12')
  ),
  address: Joi.object({
    street: Joi.string().trim(),
    city: Joi.string().trim(),
    state: Joi.string().trim(),
    zipCode: Joi.string().trim(),
    country: Joi.string().trim(),
  }),
  phone: Joi.string().trim(),
  email: Joi.string().email(),
  website: Joi.string().uri(),
  status: Joi.string()
    .valid('active', 'inactive', 'closed', 'under_construction')
    .default('active'),
});

export const updateSchoolSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200),
  code: Joi.string().trim().min(1).max(20).uppercase(),
  description: Joi.string().trim().max(1000),
  type: Joi.string().valid('elementary', 'middle', 'high', 'k8', 'k12', 'alternative', 'charter'),
  grade_levels: Joi.array().items(
    Joi.string().valid('PK', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12')
  ),
  address: Joi.object({
    street: Joi.string().trim(),
    city: Joi.string().trim(),
    state: Joi.string().trim(),
    zipCode: Joi.string().trim(),
    country: Joi.string().trim(),
  }),
  phone: Joi.string().trim(),
  email: Joi.string().email(),
  website: Joi.string().uri(),
  status: Joi.string().valid('active', 'inactive', 'closed', 'under_construction'),
}).min(1).messages({
  'object.min': 'At least one field is required for update',
});

export const querySchoolSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(25),
  status: Joi.string().valid('active', 'inactive', 'closed', 'under_construction'),
  district_id: objectId,
  type: Joi.string().valid('elementary', 'middle', 'high', 'k8', 'k12', 'alternative', 'charter'),
  search: Joi.string().trim().max(100),
});
