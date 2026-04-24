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
    // ─── Geographic References ──────────────────────
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      default: null,
    },
    countryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      default: null,
    },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
      default: null,
    },
    countyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'County',
      default: null,
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
    // ─── Branding (BASE — inherited by all schools in district) ──
    branding: {
      primaryColor:   { type: String, default: null },
      secondaryColor: { type: String, default: null },
      accentColor:    { type: String, default: null },
      backgroundColor:{ type: String, default: null },
      textColor:      { type: String, default: null },
      fontFamily:     { type: String, default: null },
      logo:           { type: String, default: null }, // URL
      favicon:        { type: String, default: null }, // URL
      loginBannerText:{ type: String, default: null },
      loginSubText:   { type: String, default: null },
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