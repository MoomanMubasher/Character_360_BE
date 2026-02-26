// BACKEND/src/modules/districts/district.model.js

import mongoose from 'mongoose';

const districtSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'District name is required'],
      trim: true,
      maxlength: [200, 'District name cannot exceed 200 characters'],
    },
    code: {
      type: String,
      required: [true, 'District code is required'],
      unique: true, // This auto-creates index, no need for schema.index()
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String, default: 'Michigan' },
      zipCode: { type: String },
      country: { type: String, default: 'USA' },
    },
    phone: { type: String },
    email: { type: String },
    website: { type: String },
    superintendentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'basic', 'standard', 'premium', 'enterprise'],
        default: 'free',
      },
      startDate: { type: Date },
      endDate: { type: Date },
      maxSchools: { type: Number, default: 1 },
      maxStudents: { type: Number, default: 100 },
      maxStaff: { type: Number, default: 20 },
      isActive: { type: Boolean, default: true },
    },
    settings: {
      academicYearStart: { type: Number, default: 8 },
      academicYearEnd: { type: Number, default: 6 },
      gradingScale: {
        type: String,
        enum: ['letter', 'percentage', 'gpa', 'custom'],
        default: 'letter',
      },
      timezone: { type: String, default: 'America/Detroit' },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'trial'],
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

// Only non-duplicate indexes
districtSchema.index({ status: 1 });
// code already indexed via unique: true

districtSchema.virtual('schools', {
  ref: 'School',
  localField: '_id',
  foreignField: 'districtId',
});

const District = mongoose.model('District', districtSchema);
export default District;