// BACKEND/src/modules/attendance/attendance.model.js

import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
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
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
    },
    academicYear: { type: String, required: true },
    period: { type: Number }, // Which period of the day

    // ─── Attendance Records ─────────────────────────
    records: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Student',
          required: true,
        },
        status: {
          type: String,
          enum: ['present', 'absent', 'late', 'excused', 'half_day', 'remote'],
          required: true,
        },
        arrivalTime: { type: String },
        departureTime: { type: String },
        reason: { type: String },
        notes: { type: String },
        parentNotified: { type: Boolean, default: false },
      },
    ],

    // ─── Summary ────────────────────────────────────
    summary: {
      total: { type: Number, default: 0 },
      present: { type: Number, default: 0 },
      absent: { type: Number, default: 0 },
      late: { type: Number, default: 0 },
      excused: { type: Number, default: 0 },
    },

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isFinalized: { type: Boolean, default: false },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({ schoolId: 1, date: 1 });
attendanceSchema.index({ classId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ 'records.studentId': 1, date: 1 });
attendanceSchema.index({ date: 1, academicYear: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;