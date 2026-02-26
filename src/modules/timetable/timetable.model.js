// BACKEND/src/modules/timetable/timetable.model.js

import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema(
  {
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    academicYear: { type: String, required: true },

    // ─── Weekly Schedule ────────────────────────────
    schedule: [
      {
        day: {
          type: String,
          enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          required: true,
        },
        periods: [
          {
            periodNumber: { type: Number, required: true },
            startTime: { type: String, required: true },
            endTime: { type: String, required: true },
            subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
            subjectName: { type: String },
            teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            teacherName: { type: String },
            room: { type: String },
            type: {
              type: String,
              enum: ['class', 'break', 'lunch', 'assembly', 'free', 'lab', 'library', 'pe'],
              default: 'class',
            },
          },
        ],
      },
    ],

    effectiveFrom: { type: Date, required: true },
    effectiveTo: { type: Date },
    isActive: { type: Boolean, default: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

timetableSchema.index({ schoolId: 1, classId: 1, isActive: 1 });

const Timetable = mongoose.model('Timetable', timetableSchema);
export default Timetable;