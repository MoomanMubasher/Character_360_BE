// BACKEND/src/modules/academic/academic-years/academicYear.model.js

import mongoose from 'mongoose';

const academicYearSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // e.g., '2024-2025'
    },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },

    // ─── Terms / Semesters ──────────────────────────
    terms: [
      {
        name: { type: String }, // e.g., 'Fall Semester', 'Spring Semester'
        startDate: { type: Date },
        endDate: { type: Date },
        type: {
          type: String,
          enum: ['semester', 'trimester', 'quarter', 'term'],
          default: 'semester',
        },
      },
    ],

    // ─── Grading Periods ────────────────────────────
    gradingPeriods: [
      {
        name: { type: String }, // e.g., 'Q1', 'Q2', 'Midterm'
        startDate: { type: Date },
        endDate: { type: Date },
        gradesDueDate: { type: Date },
        reportCardDate: { type: Date },
      },
    ],

    // ─── Holidays & Breaks ──────────────────────────
    holidays: [
      {
        name: { type: String },
        date: { type: Date },
        endDate: { type: Date },
        type: {
          type: String,
          enum: ['holiday', 'break', 'professional_day', 'snow_day', 'other'],
        },
      },
    ],

    isCurrent: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['planning', 'active', 'completed', 'archived'],
      default: 'planning',
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

academicYearSchema.index({ districtId: 1, isCurrent: 1 });
academicYearSchema.index({ name: 1, districtId: 1 }, { unique: true });

const AcademicYear = mongoose.model('AcademicYear', academicYearSchema);
export default AcademicYear;