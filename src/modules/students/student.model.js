// BACKEND/src/modules/students/student.model.js

import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      // Removed: index: true
    },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: [true, 'District is required'],
      // Removed: index: true
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School assignment is required'],
      // Removed: index: true
    },
    studentId: {
      type: String,
      unique: true, // Auto-creates index
      required: [true, 'Student ID is required'],
      trim: true,
    },
    stateStudentId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    gradeLevel: {
      type: String,
      required: [true, 'Grade level is required'],
      enum: ['PK', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      default: null,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      default: null,
    },
    academicYear: {
      type: String,
      required: true,
    },
    enrollmentDate: {
      type: Date,
      required: [true, 'Enrollment date is required'],
    },
    enrollmentType: {
      type: String,
      enum: ['new', 'transfer', 're_enrollment', 'mid_year'],
      default: 'new',
    },
    previousSchool: {
      name: { type: String },
      address: { type: String },
      lastGradeCompleted: { type: String },
      transferDate: { type: Date },
      reasonForTransfer: { type: String },
    },
    guardians: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        relationship: {
          type: String,
          enum: ['mother', 'father', 'guardian', 'grandparent', 'other'],
          required: true,
        },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String },
        phone: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
        isEmergencyContact: { type: Boolean, default: true },
        hasPortalAccess: { type: Boolean, default: false },
        occupation: { type: String },
        workPhone: { type: String },
        address: {
          street: { type: String },
          city: { type: String },
          state: { type: String, default: 'Michigan' },
          zipCode: { type: String },
          country: { type: String, default: 'USA' },
        },
        livesWithStudent: { type: Boolean, default: true },
        custodyRights: {
          type: String,
          enum: ['full', 'joint', 'none', 'not_applicable'],
          default: 'not_applicable',
        },
      },
    ],
    medical: {
      bloodGroup: { type: String },
      allergies: [{ type: String }],
      medications: [
        {
          name: { type: String },
          dosage: { type: String },
          frequency: { type: String },
          prescribedBy: { type: String },
        },
      ],
      conditions: [{ type: String }],
      immunizationUpToDate: { type: Boolean, default: false },
      lastPhysicalExam: { type: Date },
      insuranceProvider: { type: String },
      insurancePolicyNumber: { type: String },
      doctorName: { type: String },
      doctorPhone: { type: String },
      specialNeeds: { type: String },
      hasIEP: { type: Boolean, default: false },
      has504Plan: { type: Boolean, default: false },
    },
    transportation: {
      mode: {
        type: String,
        enum: ['bus', 'car', 'walk', 'bike', 'other'],
        default: 'bus',
      },
      busRoute: { type: String },
      busStop: { type: String },
      pickupTime: { type: String },
      dropoffTime: { type: String },
    },
    mealPlan: {
      type: {
        type: String,
        enum: ['free', 'reduced', 'full_price', 'none'],
        default: 'none',
      },
      dietaryRestrictions: [{ type: String }],
    },
    demographics: {
      ethnicity: { type: String },
      race: [{ type: String }],
      primaryLanguage: { type: String, default: 'English' },
      homeLanguage: { type: String, default: 'English' },
      isELL: { type: Boolean, default: false },
      birthCountry: { type: String, default: 'USA' },
      citizenship: { type: String, default: 'US Citizen' },
    },
    enrollmentStatus: {
      type: String,
      enum: [
        'pre_enrolled', 'pending_review', 'approved', 'active',
        'inactive', 'withdrawn', 'transferred', 'graduated',
        'expelled', 'suspended',
      ],
      default: 'pre_enrolled',
    },
    withdrawalDate: { type: Date },
    withdrawalReason: { type: String },
    graduationDate: { type: Date },
    statusHistory: [
      {
        status: { type: String },
        date: { type: Date, default: Date.now },
        reason: { type: String },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    documents: [
      {
        type: {
          type: String,
          enum: [
            'birth_certificate', 'immunization_record', 'proof_of_residency',
            'previous_report_card', 'iep_document', 'custody_order',
            'medical_record', 'other',
          ],
        },
        fileName: { type: String },
        fileUrl: { type: String },
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        verified: { type: Boolean, default: false },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    notes: {
      type: String,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
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
studentSchema.index({ districtId: 1, enrollmentStatus: 1 });
studentSchema.index({ schoolId: 1, gradeLevel: 1 });
studentSchema.index({ classId: 1 });
studentSchema.index({ 'guardians.userId': 1 });
studentSchema.index({ enrollmentStatus: 1 });
// studentId already indexed via unique: true
// userId already indexed via unique: true
// districtId + schoolId covered by compound indexes above

// ─── Virtuals ─────────────────────────────────────────
studentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

studentSchema.virtual('school', {
  ref: 'School',
  localField: 'schoolId',
  foreignField: '_id',
  justOne: true,
});

studentSchema.virtual('class', {
  ref: 'Class',
  localField: 'classId',
  foreignField: '_id',
  justOne: true,
});

studentSchema.virtual('primaryGuardian').get(function () {
  return this.guardians?.find((g) => g.isPrimary) || this.guardians?.[0];
});

// ─── Pre-save: Track status changes (Mongoose 8 compatible) ──
studentSchema.pre('save', function () {
  if (this.isModified('enrollmentStatus')) {
    this.statusHistory.push({
      status: this.enrollmentStatus,
      date: new Date(),
      changedBy: this.updatedBy,
    });
  }
});

const Student = mongoose.model('Student', studentSchema);
export default Student;