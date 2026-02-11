const Joi = require('joi');

const GRADE_LEVELS = ['PK', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const guardianSchema = Joi.object({
  relationship: Joi.string()
    .valid('mother', 'father', 'guardian', 'grandparent', 'other')
    .required(),
  firstName: Joi.string().trim().max(50).required(),
  lastName: Joi.string().trim().max(50).required(),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().trim().required(),
  isPrimary: Joi.boolean().default(false),
  isEmergencyContact: Joi.boolean().default(true),
  hasPortalAccess: Joi.boolean().default(false),
  occupation: Joi.string().allow('', null),
  workPhone: Joi.string().allow('', null),
  address: Joi.object({
    street: Joi.string().allow('', null),
    city: Joi.string().allow('', null),
    state: Joi.string().default('Michigan'),
    zipCode: Joi.string().allow('', null),
    country: Joi.string().default('USA'),
  }),
  livesWithStudent: Joi.boolean().default(true),
  custodyRights: Joi.string()
    .valid('full', 'joint', 'none', 'not_applicable')
    .default('not_applicable'),
});

const createStudentSchema = Joi.object({
  // User fields
  firstName: Joi.string().trim().max(50).required(),
  lastName: Joi.string().trim().max(50).required(),
  middleName: Joi.string().trim().max(50).allow('', null),
  email: Joi.string().email().allow('', null), // Students may not have email
  password: Joi.string().min(8).max(128).allow('', null),
  phone: Joi.string().trim().allow('', null),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say'),
  dateOfBirth: Joi.date().iso().max('now').required(),
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

  // Student-specific
  studentId: Joi.string().trim().allow('', null), // Auto-generated if not provided
  stateStudentId: Joi.string().trim().allow('', null),
  gradeLevel: Joi.string().valid(...GRADE_LEVELS).required(),
  classId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  sectionId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  academicYear: Joi.string().allow('', null), // Auto-generated if not provided
  enrollmentDate: Joi.date().iso(),
  enrollmentType: Joi.string()
    .valid('new', 'transfer', 're_enrollment', 'mid_year')
    .default('new'),

  previousSchool: Joi.object({
    name: Joi.string().allow('', null),
    address: Joi.string().allow('', null),
    lastGradeCompleted: Joi.string().allow('', null),
    transferDate: Joi.date().iso(),
    reasonForTransfer: Joi.string().allow('', null),
  }),

  guardians: Joi.array().items(guardianSchema).min(1).required(),

  medical: Joi.object({
    bloodGroup: Joi.string().allow('', null),
    allergies: Joi.array().items(Joi.string()),
    medications: Joi.array(),
    conditions: Joi.array().items(Joi.string()),
    immunizationUpToDate: Joi.boolean().default(false),
    lastPhysicalExam: Joi.date().iso(),
    insuranceProvider: Joi.string().allow('', null),
    insurancePolicyNumber: Joi.string().allow('', null),
    doctorName: Joi.string().allow('', null),
    doctorPhone: Joi.string().allow('', null),
    specialNeeds: Joi.string().allow('', null),
    hasIEP: Joi.boolean().default(false),
    has504Plan: Joi.boolean().default(false),
  }),

  transportation: Joi.object({
    mode: Joi.string().valid('bus', 'car', 'walk', 'bike', 'other'),
    busRoute: Joi.string().allow('', null),
    busStop: Joi.string().allow('', null),
    pickupTime: Joi.string().allow('', null),
    dropoffTime: Joi.string().allow('', null),
  }),

  mealPlan: Joi.object({
    type: Joi.string().valid('free', 'reduced', 'full_price', 'none'),
    dietaryRestrictions: Joi.array().items(Joi.string()),
  }),

  demographics: Joi.object({
    ethnicity: Joi.string().allow('', null),
    race: Joi.array().items(Joi.string()),
    primaryLanguage: Joi.string().default('English'),
    homeLanguage: Joi.string().default('English'),
    isELL: Joi.boolean().default(false),
    birthCountry: Joi.string().default('USA'),
    citizenship: Joi.string().default('US Citizen'),
  }),

  notes: Joi.string().max(2000).allow('', null),
});

const updateStudentSchema = Joi.object({
  firstName: Joi.string().trim().max(50),
  lastName: Joi.string().trim().max(50),
  middleName: Joi.string().trim().max(50).allow('', null),
  phone: Joi.string().trim().allow('', null),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say'),
  dateOfBirth: Joi.date().iso().max('now'),
  address: Joi.object(),
  gradeLevel: Joi.string().valid(...GRADE_LEVELS),
  classId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  sectionId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  academicYear: Joi.string(),
  enrollmentType: Joi.string().valid('new', 'transfer', 're_enrollment', 'mid_year'),
  guardians: Joi.array().items(guardianSchema),
  medical: Joi.object(),
  transportation: Joi.object(),
  mealPlan: Joi.object(),
  demographics: Joi.object(),
  enrollmentStatus: Joi.string().valid(
    'pre_enrolled', 'pending_review', 'approved', 'active',
    'inactive', 'withdrawn', 'transferred', 'graduated',
    'expelled', 'suspended'
  ),
  notes: Joi.string().max(2000).allow('', null),
}).min(1);

const transferStudentSchema = Joi.object({
  newSchoolId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  reason: Joi.string().max(500).required(),
});

const withdrawStudentSchema = Joi.object({
  reason: Joi.string().max(500).required(),
});

const queryStudentSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow('', null),
  enrollmentStatus: Joi.string().valid(
    'pre_enrolled', 'pending_review', 'approved', 'active',
    'inactive', 'withdrawn', 'transferred', 'graduated',
    'expelled', 'suspended'
  ),
  gradeLevel: Joi.string().valid(...GRADE_LEVELS),
  classId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null),
  academicYear: Joi.string(),
  sortBy: Joi.string()
    .valid('createdAt', 'enrollmentDate', 'gradeLevel', 'enrollmentStatus')
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

module.exports = {
  createStudentSchema,
  updateStudentSchema,
  transferStudentSchema,
  withdrawStudentSchema,
  queryStudentSchema,
};