
const Joi = require('joi');

const createTeacherSchema = Joi.object({
  // User fields
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

  // Scoping
  districtId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  schoolId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),

  // Teacher-specific
  employeeId: Joi.string().trim().allow('', null),
  designation: Joi.string()
    .valid('teacher', 'senior_teacher', 'lead_teacher', 'teaching_assistant', 'substitute_teacher')
    .default('teacher'),
  subjects: Joi.array().items(
    Joi.object({
      subjectId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
      subjectName: Joi.string().required(),
      isPrimary: Joi.boolean().default(false),
    })
  ),
  gradeLevels: Joi.array().items(Joi.string()),
  departmentId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  dateOfJoining: Joi.date().iso().required(),
  yearsOfExperience: Joi.number().min(0).allow(null),
  contractType: Joi.string()
    .valid('full_time', 'part_time', 'contract', 'substitute', 'intern')
    .default('full_time'),
  specializations: Joi.array().items(Joi.string()),

  certifications: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      issuingAuthority: Joi.string().allow('', null),
      dateIssued: Joi.date().iso(),
      expiryDate: Joi.date().iso(),
      certificateNumber: Joi.string().allow('', null),
      state: Joi.string().default('Michigan'),
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

  previousEmployment: Joi.array().items(
    Joi.object({
      organization: Joi.string().required(),
      position: Joi.string().allow('', null),
      fromDate: Joi.date().iso(),
      toDate: Joi.date().iso(),
    })
  ),

  maxClassesPerDay: Joi.number().min(1).max(12).default(6),
  maxClassesPerWeek: Joi.number().min(1).max(60).default(30),

  emergencyContact: Joi.object({
    name: Joi.string().allow('', null),
    relationship: Joi.string().allow('', null),
    phone: Joi.string().allow('', null),
    email: Joi.string().email().allow('', null),
  }),

  notes: Joi.string().max(1000).allow('', null),
});

const updateTeacherSchema = Joi.object({
  firstName: Joi.string().trim().max(50),
  lastName: Joi.string().trim().max(50),
  middleName: Joi.string().trim().max(50).allow('', null),
  phone: Joi.string().trim().allow('', null),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say'),
  dateOfBirth: Joi.date().iso().max('now'),
  address: Joi.object(),
  employeeId: Joi.string().trim().allow('', null),
  designation: Joi.string().valid('teacher', 'senior_teacher', 'lead_teacher', 'teaching_assistant', 'substitute_teacher'),
  subjects: Joi.array(),
  gradeLevels: Joi.array().items(Joi.string()),
  departmentId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  dateOfJoining: Joi.date().iso(),
  dateOfLeaving: Joi.date().iso().allow(null),
  yearsOfExperience: Joi.number().min(0),
  contractType: Joi.string().valid('full_time', 'part_time', 'contract', 'substitute', 'intern'),
  specializations: Joi.array().items(Joi.string()),
  certifications: Joi.array(),
  educationBackground: Joi.array(),
  previousEmployment: Joi.array(),
  maxClassesPerDay: Joi.number().min(1).max(12),
  maxClassesPerWeek: Joi.number().min(1).max(60),
  availablePeriods: Joi.array(),
  emergencyContact: Joi.object(),
  status: Joi.string().valid('active', 'inactive', 'on_leave', 'transferred', 'terminated', 'suspended'),
  notes: Joi.string().max(1000).allow('', null),
}).min(1);

const assignClassSchema = Joi.object({
  classId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  role: Joi.string()
    .valid('class_teacher', 'subject_teacher', 'assistant')
    .default('subject_teacher'),
});

const queryTeacherSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow('', null),
  status: Joi.string().valid('active', 'inactive', 'on_leave', 'transferred', 'terminated', 'suspended'),
  designation: Joi.string().valid('teacher', 'senior_teacher', 'lead_teacher', 'teaching_assistant', 'substitute_teacher'),
  subject: Joi.string().trim().allow('', null),
  gradeLevel: Joi.string().trim().allow('', null),
  sortBy: Joi.string().valid('createdAt', 'dateOfJoining', 'status').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

module.exports = {
  createTeacherSchema,
  updateTeacherSchema,
  assignClassSchema,
  queryTeacherSchema,
};