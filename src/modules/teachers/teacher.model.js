// BACKEND/src/modules/teachers/teacher.model.js

const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    // ─── Link to Base User ──────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },

    // ─── Multi-Tenant Scoping ───────────────────────
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: [true, 'District is required'],
      index: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School is required'],
      index: true,
    },

    // ─── Professional Info ──────────────────────────
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    designation: {
      type: String,
      enum: [
        'teacher',
        'senior_teacher',
        'lead_teacher',
        'teaching_assistant',
        'substitute_teacher',
      ],
      default: 'teacher',
    },

    // ─── Academic Details ───────────────────────────
    subjects: [
      {
        subjectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Subject',
        },
        subjectName: { type: String },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    gradeLevels: [
      {
        type: String, // e.g., 'K', '1', '2', ... '12'
      },
    ],
    classAssignments: [
      {
        classId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Class',
        },
        role: {
          type: String,
          enum: ['class_teacher', 'subject_teacher', 'assistant'],
          default: 'subject_teacher',
        },
        assignedDate: { type: Date, default: Date.now },
      },
    ],
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },

    // ─── Qualifications ─────────────────────────────
    certifications: [
      {
        name: { type: String },
        issuingAuthority: { type: String },
        dateIssued: { type: Date },
        expiryDate: { type: Date },
        certificateNumber: { type: String },
        state: { type: String, default: 'Michigan' },
      },
    ],
    educationBackground: [
      {
        degree: { type: String },
        institution: { type: String },
        fieldOfStudy: { type: String },
        yearCompleted: { type: Number },
      },
    ],
    specializations: [
      {
        type: String, // e.g., 'Special Education', 'ESL', 'STEM'
      },
    ],

    // ─── Employment Details ─────────────────────────
    dateOfJoining: {
      type: Date,
      required: [true, 'Date of joining is required'],
    },
    dateOfLeaving: {
      type: Date,
      default: null,
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
    },
    contractType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'substitute', 'intern'],
      default: 'full_time',
    },
    previousEmployment: [
      {
        organization: { type: String },
        position: { type: String },
        fromDate: { type: Date },
        toDate: { type: Date },
      },
    ],

    // ─── Schedule ───────────────────────────────────
    maxClassesPerDay: {
      type: Number,
      default: 6,
    },
    maxClassesPerWeek: {
      type: Number,
      default: 30,
    },
    availablePeriods: [
      {
        day: {
          type: String,
          enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        },
        periods: [{ type: Number }], // Period numbers
      },
    ],

    // ─── Emergency Contact ──────────────────────────
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String },
      email: { type: String },
    },

    // ─── Status ─────────────────────────────────────
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave', 'transferred', 'terminated', 'suspended'],
      default: 'active',
    },

    // ─── Metadata ───────────────────────────────────
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────
teacherSchema.index({ districtId: 1, schoolId: 1 });
teacherSchema.index({ status: 1 });
teacherSchema.index({ 'classAssignments.classId': 1 });
teacherSchema.index({ 'subjects.subjectId': 1 });

// ─── Virtuals ─────────────────────────────────────────
teacherSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

teacherSchema.virtual('school', {
  ref: 'School',
  localField: 'schoolId',
  foreignField: '_id',
  justOne: true,
});

teacherSchema.virtual('assignedClasses', {
  ref: 'Class',
  localField: 'classAssignments.classId',
  foreignField: '_id',
});

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;