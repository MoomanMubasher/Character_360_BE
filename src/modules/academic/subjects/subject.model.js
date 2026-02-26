// BACKEND/src/modules/academic/subjects/subject.model.js

import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      uppercase: true,
      trim: true,
    },
    description: { type: String },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
    },

    // ─── Academic Details ───────────────────────────
    category: {
      type: String,
      enum: [
        'core', 'elective', 'honors', 'ap',
        'special_education', 'physical_education',
        'arts', 'technology', 'foreign_language', 'other',
      ],
      default: 'core',
    },
    gradeLevels: [
      {
        type: String,
        enum: ['PK', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      },
    ],
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },

    // ─── Credits & Grading ──────────────────────────
    credits: { type: Number, default: 1 },
    passingGrade: { type: Number, default: 60 },
    maxGrade: { type: Number, default: 100 },
    isGPAIncluded: { type: Boolean, default: true },

    // ─── Prerequisites ──────────────────────────────
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],

    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

subjectSchema.index({ districtId: 1, schoolId: 1 });
subjectSchema.index({ code: 1, schoolId: 1 }, { unique: true });
subjectSchema.index({ category: 1 });

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;