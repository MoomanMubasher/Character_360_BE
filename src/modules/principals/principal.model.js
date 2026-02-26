// BACKEND/src/modules/principals/principal.model.js

import mongoose from 'mongoose';

const principalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      // Removed: index: true (unique auto-creates index)
    },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: [true, 'District is required'],
      // Removed: index: true (covered by compound index below)
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School is required'],
      // Removed: index: true (covered by compound index below)
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    title: {
      type: String,
      enum: ['principal', 'vice_principal', 'assistant_principal'],
      default: 'principal',
    },
    certifications: [
      {
        name: { type: String },
        issuingAuthority: { type: String },
        dateIssued: { type: Date },
        expiryDate: { type: Date },
        certificateNumber: { type: String },
      },
    ],
    educationBackground: [
      {
        degree: { type: String },
        institution: { type: String },
        fieldOfStudy: { type: String },
        yearCompleted: { type: Number },
      },
    ],
    dateOfJoining: {
      type: Date,
      required: [true, 'Date of joining is required'],
    },
    dateOfLeaving: { type: Date, default: null },
    yearsOfExperience: { type: Number, min: 0 },
    previousSchools: [
      {
        schoolName: { type: String },
        position: { type: String },
        fromDate: { type: Date },
        toDate: { type: Date },
      },
    ],
    contractType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'interim'],
      default: 'full_time',
    },
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String },
      email: { type: String },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave', 'transferred', 'terminated'],
      default: 'active',
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
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

// Only non-duplicate indexes
principalSchema.index({ districtId: 1, schoolId: 1 });
principalSchema.index({ status: 1 });
// userId already indexed via unique: true

principalSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

principalSchema.virtual('school', {
  ref: 'School',
  localField: 'schoolId',
  foreignField: '_id',
  justOne: true,
});

const Principal = mongoose.model('Principal', principalSchema);
export default Principal;