// BACKEND/src/modules/exams/exam.model.js

import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Exam name is required'],
      trim: true,
    },
    description: { type: String },

    districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    academicYear: { type: String, required: true },

    type: {
      type: String,
      enum: ['quiz', 'unit_test', 'midterm', 'final', 'standardized', 'placement', 'diagnostic', 'other'],
      required: true,
    },
    gradingPeriod: {
      type: String,
      enum: ['Q1', 'Q2', 'Q3', 'Q4', 'S1', 'S2', 'midterm', 'final'],
    },

    // ─── Schedule ───────────────────────────────────
    date: { type: Date, required: true },
    startTime: { type: String },
    endTime: { type: String },
    duration: { type: Number }, // minutes
    room: { type: String },

    // ─── Grading ────────────────────────────────────
    totalMarks: { type: Number, required: true },
    passingMarks: { type: Number },
    weightPercentage: { type: Number, default: 0 },

    // ─── Results ────────────────────────────────────
    results: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        marksObtained: { type: Number },
        percentage: { type: Number },
        grade: { type: String },
        status: {
          type: String,
          enum: ['pass', 'fail', 'absent', 'exempt', 'pending'],
          default: 'pending',
        },
        remarks: { type: String },
      },
    ],

    supervisors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    isPublished: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled', 'postponed'],
      default: 'scheduled',
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

examSchema.index({ schoolId: 1, date: 1 });
examSchema.index({ classId: 1, subjectId: 1 });
examSchema.index({ status: 1 });

const Exam = mongoose.model('Exam', examSchema);
export default Exam;