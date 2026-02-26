// BACKEND/src/modules/discipline/discipline.model.js

import mongoose from 'mongoose';

const disciplineSchema = new mongoose.Schema(
  {
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    academicYear: { type: String, required: true },

    // ─── Incident ───────────────────────────────────
    incidentDate: { type: Date, required: true },
    incidentTime: { type: String },
    location: { type: String },
    type: {
      type: String,
      enum: [
        'behavioral', 'academic_dishonesty', 'bullying', 'fighting',
        'harassment', 'vandalism', 'substance_abuse', 'dress_code',
        'tardiness', 'truancy', 'disrespect', 'technology_misuse',
        'theft', 'other',
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'major', 'critical'],
      required: true,
    },
    description: { type: String, required: true },
    witnesses: [{ type: String }],

    // ─── Action Taken ───────────────────────────────
    actionTaken: {
      type: String,
      enum: [
        'verbal_warning', 'written_warning', 'detention',
        'in_school_suspension', 'out_of_school_suspension',
        'expulsion', 'parent_conference', 'counseling_referral',
        'community_service', 'behavior_contract', 'other',
      ],
      required: true,
    },
    actionDetails: { type: String },
    suspensionDays: { type: Number },
    suspensionStartDate: { type: Date },
    suspensionEndDate: { type: Date },

    // ─── Follow Up ──────────────────────────────────
    parentNotified: { type: Boolean, default: false },
    parentNotifiedDate: { type: Date },
    parentResponse: { type: String },
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: Date },
    followUpNotes: { type: String },

    // ─── Behavior Points ────────────────────────────
    meritPointsDeducted: { type: Number, default: 0 },

    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    status: {
      type: String,
      enum: ['reported', 'under_review', 'action_taken', 'resolved', 'appealed'],
      default: 'reported',
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

disciplineSchema.index({ studentId: 1, academicYear: 1 });
disciplineSchema.index({ schoolId: 1, incidentDate: 1 });
disciplineSchema.index({ status: 1 });
disciplineSchema.index({ type: 1, severity: 1 });

const Discipline = mongoose.model('Discipline', disciplineSchema);
export default Discipline;