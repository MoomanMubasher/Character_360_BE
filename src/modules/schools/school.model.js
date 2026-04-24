// BACKEND/src/modules/schools/school.model.js

import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'School name is required'],
      trim: true,
      maxlength: [200, 'School name cannot exceed 200 characters'],
    },
    code: {
      type: String,
      required: [true, 'School code is required'],
      unique: true, // Auto-creates index
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: [true, 'District is required'],
      // Removed: index: true (covered by compound index below)
    },
    type: {
      type: String,
      enum: ['elementary', 'middle', 'high', 'k8', 'k12', 'alternative', 'charter'],
      required: [true, 'School type is required'],
    },
    gradeLevels: [
      {
        type: String,
        enum: ['PK', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      },
    ],
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
    principalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    capacity: {
      maxStudents: { type: Number, default: 500 },
      maxTeachers: { type: Number, default: 50 },
      maxClassrooms: { type: Number, default: 30 },
    },
    schedule: {
      startTime: { type: String, default: '08:00' },
      endTime: { type: String, default: '15:00' },
      periodsPerDay: { type: Number, default: 7 },
      periodDuration: { type: Number, default: 50 },
      daysOfWeek: {
        type: [String],
        default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      },
    },
    currentAcademicYear: {
      type: String,
      default: () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        if (month >= 7) return `${year}-${year + 1}`;
        return `${year - 1}-${year}`;
      },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'closed', 'under_construction'],
      default: 'active',
    },
    // ─── Branding (OVERRIDE — extends district branding) ────────
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
schoolSchema.index({ districtId: 1, status: 1 });
schoolSchema.index({ status: 1 });
// code already indexed via unique: true
// districtId covered by compound index above

schoolSchema.virtual('district', {
  ref: 'District',
  localField: 'districtId',
  foreignField: '_id',
  justOne: true,
});

schoolSchema.virtual('teachers', {
  ref: 'Teacher',
  localField: '_id',
  foreignField: 'schoolId',
});

schoolSchema.virtual('students', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'schoolId',
});

const School = mongoose.model('School', schoolSchema);
export default School;