// BACKEND/src/modules/academic/assignments/assignment.model.js

import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
    },
    description: { type: String },
    instructions: { type: String },

    districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    academicYear: { type: String, required: true },

    type: {
      type: String,
      enum: ['homework', 'classwork', 'project', 'essay', 'lab', 'presentation', 'other'],
      default: 'homework',
    },
    category: {
      type: String,
      enum: ['formative', 'summative'],
      default: 'formative',
    },

    // ─── Grading ────────────────────────────────────
    totalPoints: { type: Number, required: true },
    weightPercentage: { type: Number, default: 0 },
    gradingRubric: { type: String },

    // ─── Dates ──────────────────────────────────────
    assignedDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    lateSubmissionDeadline: { type: Date },
    allowLateSubmission: { type: Boolean, default: false },
    latePenaltyPercent: { type: Number, default: 0 },

    // ─── Attachments ────────────────────────────────
    attachments: [
      {
        fileName: { type: String },
        fileUrl: { type: String },
        fileType: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // ─── Submissions ────────────────────────────────
    submissions: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        submittedAt: { type: Date },
        files: [
          {
            fileName: { type: String },
            fileUrl: { type: String },
          },
        ],
        textResponse: { type: String },
        score: { type: Number },
        feedback: { type: String },
        gradedAt: { type: Date },
        gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: {
          type: String,
          enum: ['pending', 'submitted', 'late', 'graded', 'returned', 'missing'],
          default: 'pending',
        },
      },
    ],

    isPublished: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed', 'archived'],
      default: 'draft',
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

assignmentSchema.index({ schoolId: 1, classId: 1 });
assignmentSchema.index({ teacherId: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ status: 1 });

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;