// BACKEND/src/modules/academic/grades/grade.model.js

import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema(
  {
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    academicYear: { type: String, required: true },

    // ─── Grading Period ─────────────────────────────
    gradingPeriod: {
      type: String,
      enum: ['Q1', 'Q2', 'Q3', 'Q4', 'S1', 'S2', 'midterm', 'final', 'annual'],
      required: true,
    },

    // ─── Scores ─────────────────────────────────────
    score: { type: Number },
    maxScore: { type: Number, default: 100 },
    percentage: { type: Number },
    letterGrade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'I', 'W', 'P', 'NP'],
    },
    gpaPoints: { type: Number },

    // ─── Breakdown ──────────────────────────────────
    breakdown: {
      homework: { score: Number, weight: Number },
      classwork: { score: Number, weight: Number },
      quizzes: { score: Number, weight: Number },
      exams: { score: Number, weight: Number },
      projects: { score: Number, weight: Number },
      participation: { score: Number, weight: Number },
    },

    comments: { type: String },
    isFinalized: { type: Boolean, default: false },
    finalizedAt: { type: Date },
    finalizedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

gradeSchema.index({ studentId: 1, academicYear: 1 });
gradeSchema.index({ classId: 1, gradingPeriod: 1 });
gradeSchema.index({ studentId: 1, subjectId: 1, gradingPeriod: 1 }, { unique: true });
gradeSchema.index({ schoolId: 1, academicYear: 1 });

const Grade = mongoose.model('Grade', gradeSchema);
export default Grade;