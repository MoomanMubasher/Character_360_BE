// BACKEND/src/modules/principals/principal.validation.js

import Joi from 'joi';

export const createPrincipalSchema = Joi.object({
  firstName: Joi.string().trim().max(50).required(),
  lastName: Joi.string().trim().max(50).required(),
  middleName: Joi.string().trim().max(50).allow('', null),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  phone: Joi.string().trim().allow('', null),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say'),
  dateOfBirth: Joi.date().iso().max('now'),
  address: Joi.object({
    street: Joi.string().allow('', null),
    city: Joi.string().allow('', null),
    state: Joi.string().default('Michigan'),
    zipCode: Joi.string().allow('', null),
    country: Joi.string().default('USA'),
  }),

  districtId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
    .messages({ 'string.pattern.base': 'Invalid district ID' }),
  schoolId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
    .messages({ 'string.pattern.base': 'Invalid school ID' }),

  employeeId: Joi.string().trim().allow('', null),
  title: Joi.string()
    .valid('principal', 'vice_principal', 'assistant_principal')
    .default('principal'),
  dateOfJoining: Joi.date().iso().required(),
  yearsOfExperience: Joi.number().min(0).allow(null),
  contractType: Joi.string()
    .valid('full_time', 'part_time', 'contract', 'interim')
    .default('full_time'),

  certifications: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      issuingAuthority: Joi.string().allow('', null),
      dateIssued: Joi.date().iso(),
      expiryDate: Joi.date().iso(),
      certificateNumber: Joi.string().allow('', null),
    })
  ),

  educationBackground: Joi.array().items(
    Joi.object({
      degree: Joi.string().required(),
      institution: Joi.string().required(),
      fieldOfStudy: Joi.string().allow('', null),
      yearCompleted: Joi.number().min(1950).max(new Date().getFullYear()),
    })
  ),

  previousSchools: Joi.array().items(
    Joi.object({
      schoolName: Joi.string().required(),
      position: Joi.string().allow('', null),
      fromDate: Joi.date().iso(),
      toDate: Joi.date().iso(),
    })
  ),

  emergencyContact: Joi.object({
    name: Joi.string().allow('', null),
    relationship: Joi.string().allow('', null),
    phone: Joi.string().allow('', null),
    email: Joi.string().email().allow('', null),
  }),

  notes: Joi.string().max(1000).allow('', null),
});

export const updatePrincipalSchema = Joi.object({
  firstName: Joi.string().trim().max(50),
  lastName: Joi.string().trim().max(50),
  middleName: Joi.string().trim().max(50).allow('', null),
  phone: Joi.string().trim().allow('', null),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say'),
  dateOfBirth: Joi.date().iso().max('now'),
  address: Joi.object({
    street: Joi.string().allow('', null),
    city: Joi.string().allow('', null),
    state: Joi.string(),
    zipCode: Joi.string().allow('', null),
    country: Joi.string(),
  }),
  employeeId: Joi.string().trim().allow('', null),
  title: Joi.string().valid('principal', 'vice_principal', 'assistant_principal'),
  dateOfJoining: Joi.date().iso(),
  dateOfLeaving: Joi.date().iso().allow(null),
  yearsOfExperience: Joi.number().min(0),
  contractType: Joi.string().valid('full_time', 'part_time', 'contract', 'interim'),
  certifications: Joi.array(),
  educationBackground: Joi.array(),
  previousSchools: Joi.array(),
  emergencyContact: Joi.object(),
  status: Joi.string().valid('active', 'inactive', 'on_leave', 'transferred', 'terminated'),
  notes: Joi.string().max(1000).allow('', null),
}).min(1);

export const queryPrincipalSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow('', null),
  status: Joi.string().valid('active', 'inactive', 'on_leave', 'transferred', 'terminated'),
  title: Joi.string().valid('principal', 'vice_principal', 'assistant_principal'),
  sortBy: Joi.string().valid('createdAt', 'dateOfJoining', 'status').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});