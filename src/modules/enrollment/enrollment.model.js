// BACKEND/src/modules/enrollment/enrollment.model.js

import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    // ─── Pre-Enrollment Application ─────────────────
    applicationNumber: {
      type: String,
      unique: true,
      required: true,
    },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: true,
    },
    requestedSchoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
    },
    assignedSchoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
    },
    academicYear: { type: String, required: true },

    // ─── Student Info (before user creation) ────────
    studentInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      middleName: { type: String },
      dateOfBirth: { type: Date, required: true },
      gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
      gradeLevel: {
        type: String,
        required: true,
        enum: ['PK', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      },
      address: {
        street: { type: String },
        city: { type: String },
        state: { type: String, default: 'Michigan' },
        zipCode: { type: String },
        country: { type: String, default: 'USA' },
      },
      previousSchool: {
        name: { type: String },
        address: { type: String },
        lastGradeCompleted: { type: String },
      },
    },

    // ─── Guardian Info ──────────────────────────────
    guardianInfo: [
      {
        relationship: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String },
        phone: { type: String, required: true },
        address: {
          street: { type: String },
          city: { type: String },
          state: { type: String, default: 'Michigan' },
          zipCode: { type: String },
        },
        isPrimary: { type: Boolean, default: false },
      },
    ],

    // ─── Medical Info ───────────────────────────────
    medicalInfo: {
      allergies: [{ type: String }],
      conditions: [{ type: String }],
      immunizationUpToDate: { type: Boolean, default: false },
      hasIEP: { type: Boolean, default: false },
      has504Plan: { type: Boolean, default: false },
    },

    // ─── Documents ──────────────────────────────────
    documents: [
      {
        type: { type: String },
        fileName: { type: String },
        fileUrl: { type: String },
        uploadedAt: { type: Date, default: Date.now },
        verified: { type: Boolean, default: false },
      },
    ],

    // ─── Enrollment Type ────────────────────────────
    enrollmentType: {
      type: String,
      enum: ['new', 'transfer', 're_enrollment', 'mid_year'],
      default: 'new',
    },
    entryPoint: {
      type: String,
      enum: ['online_portal', 'school_office', 'district_office'],
      default: 'online_portal',
    },

    // ─── Workflow Status ────────────────────────────
    status: {
      type: String,
      enum: [
        'draft',
        'submitted',
        'under_review',
        'documents_pending',
        'approved',
        'rejected',
        'waitlisted',
        'enrolled',
        'cancelled',
      ],
      default: 'draft',
    },
    statusHistory: [
      {
        status: { type: String },
        date: { type: Date, default: Date.now },
        reason: { type: String },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],

    // ─── Linked Student (after approval) ────────────
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
    },

    // ─── Review ─────────────────────────────────────
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewDate: { type: Date },
    reviewNotes: { type: String },
    rejectionReason: { type: String },

    submittedAt: { type: Date },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

enrollmentSchema.index({ districtId: 1, status: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ academicYear: 1 });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
export default Enrollment;