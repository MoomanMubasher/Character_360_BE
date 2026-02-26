// BACKEND/src/modules/classes/class.model.js

import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
    },
    section: {
      type: String,
      trim: true,
      default: 'A',
    },
    gradeLevel: {
      type: String,
      required: [true, 'Grade level is required'],
      enum: ['PK', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },

    // ─── Teachers ───────────────────────────────────
    classTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    subjectTeachers: [
      {
        teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
        subjectName: { type: String },
      },
    ],

    // ─── Students ───────────────────────────────────
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],

    // ─── Room / Capacity ────────────────────────────
    roomNumber: { type: String },
    capacity: { type: Number, default: 30 },

    // ─── Schedule ───────────────────────────────────
    schedule: {
      startTime: { type: String },
      endTime: { type: String },
    },

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

classSchema.index({ districtId: 1, schoolId: 1 });
classSchema.index({ schoolId: 1, gradeLevel: 1 });
classSchema.index({ schoolId: 1, academicYear: 1 });
classSchema.index({ status: 1 });

classSchema.virtual('school', {
  ref: 'School',
  localField: 'schoolId',
  foreignField: '_id',
  justOne: true,
});

const Class = mongoose.model('Class', classSchema);
export default Class;