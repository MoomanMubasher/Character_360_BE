// BACKEND/src/modules/reportCards/reportCard.model.js

import mongoose from 'mongoose';

const reportCardSchema = new mongoose.Schema(
  {
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    academicYear: { type: String, required: true },
    gradingPeriod: {
      type: String,
      enum: ['Q1', 'Q2', 'Q3', 'Q4', 'S1', 'S2', 'annual'],
      required: true,
    },

    // ─── Subject Grades ─────────────────────────────
    subjectGrades: [
      {
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
        subjectName: { type: String },
        teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        score: { type: Number },
        letterGrade: { type: String },
        gpaPoints: { type: Number },
        comments: { type: String },
      },
    ],

    // ─── Overall ────────────────────────────────────
    overallGPA: { type: Number },
    overallPercentage: { type: Number },
    classRank: { type: Number },
    totalStudents: { type: Number },

    // ─── Attendance Summary ─────────────────────────
    attendanceSummary: {
      totalDays: { type: Number },
      daysPresent: { type: Number },
      daysAbsent: { type: Number },
      daysLate: { type: Number },
      attendancePercentage: { type: Number },
    },

    // ─── Behavior & Character ───────────────────────
    behaviorGrades: {
      conduct: { type: String },
      effort: { type: String },
      participation: { type: String },
      responsibility: { type: String },
      respect: { type: String },
    },

    // ─── Comments ───────────────────────────────────
    teacherComments: { type: String },
    principalComments: { type: String },
    parentComments: { type: String },

    // ─── Status ─────────────────────────────────────
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    parentAcknowledged: { type: Boolean, default: false },
    parentAcknowledgedAt: { type: Date },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

reportCardSchema.index({ studentId: 1, academicYear: 1, gradingPeriod: 1 }, { unique: true });
reportCardSchema.index({ schoolId: 1, academicYear: 1 });

const ReportCard = mongoose.model('ReportCard', reportCardSchema);
export default ReportCard;