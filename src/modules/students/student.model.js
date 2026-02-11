const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    // ─── Link to Base User ──────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },

    // ─── Multi-Tenant Scoping (District-Owned) ──────
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: [true, 'District is required'],
      index: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School assignment is required'],
      index: true,
    },

    // ─── Student Identity ───────────────────────────
    studentId: {
      type: String,
      unique: true,
      required: [true, 'Student ID is required'],
      trim: true,
    },
    stateStudentId: {
      type: String, // Michigan state student identifier (MSID)
      unique: true,
      sparse: true,
      trim: true,
    },

    // ─── Academic Info ──────────────────────────────
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
      type: String, // e.g., '2024-2025'
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

    // ─── Previous School (for transfers) ────────────
    previousSchool: {
      name: { type: String },
      address: { type: String },
      lastGradeCompleted: { type: String },
      transferDate: { type: Date },
      reasonForTransfer: { type: String },
    },

    // ─── Parent/Guardian Info ───────────────────────
    guardians: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
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

    // ─── Health & Medical ───────────────────────────
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
      conditions: [{ type: String }], // e.g., 'Asthma', 'Diabetes'
      immunizationUpToDate: { type: Boolean, default: false },
      lastPhysicalExam: { type: Date },
      insuranceProvider: { type: String },
      insurancePolicyNumber: { type: String },
      doctorName: { type: String },
      doctorPhone: { type: String },
      specialNeeds: { type: String },
      hasIEP: { type: Boolean, default: false }, // Individualized Education Program
      has504Plan: { type: Boolean, default: false },
    },

    // ─── Transportation ─────────────────────────────
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

    // ─── Meal Plan ──────────────────────────────────
    mealPlan: {
      type: {
        type: String,
        enum: ['free', 'reduced', 'full_price', 'none'],
        default: 'none',
      },
      dietaryRestrictions: [{ type: String }],
    },

    // ─── Demographics (for state reporting) ─────────
    demographics: {
      ethnicity: { type: String },
      race: [{ type: String }],
      primaryLanguage: { type: String, default: 'English' },
      homeLanguage: { type: String, default: 'English' },
      isELL: { type: Boolean, default: false }, // English Language Learner
      birthCountry: { type: String, default: 'USA' },
      citizenship: { type: String, default: 'US Citizen' },
    },

    // ─── Enrollment Status ──────────────────────────
    enrollmentStatus: {
      type: String,
      enum: [
        'pre_enrolled',    // Application submitted
        'pending_review',  // Under district review
        'approved',        // District approved
        'active',          // Currently enrolled and attending
        'inactive',        // Temporarily inactive
        'withdrawn',       // Voluntarily withdrawn
        'transferred',     // Transferred to another school
        'graduated',       // Completed school
        'expelled',        // Expelled
        'suspended',       // Currently suspended
      ],
      default: 'pre_enrolled',
    },
    withdrawalDate: { type: Date },
    withdrawalReason: { type: String },
    graduationDate: { type: Date },

    // ─── Status History ─────────────────────────────
    statusHistory: [
      {
        status: { type: String },
        date: { type: Date, default: Date.now },
        reason: { type: String },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],

    // ─── Documents ──────────────────────────────────
    documents: [
      {
        type: {
          type: String,
          enum: [
            'birth_certificate',
            'immunization_record',
            'proof_of_residency',
            'previous_report_card',
            'iep_document',
            'custody_order',
            'medical_record',
            'other',
          ],
        },
        fileName: { type: String },
        fileUrl: { type: String },
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        verified: { type: Boolean, default: false },
        verifiedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],

    // ─── Metadata ───────────────────────────────────
    notes: {
      type: String,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────
studentSchema.index({ districtId: 1, schoolId: 1 });
studentSchema.index({ districtId: 1, enrollmentStatus: 1 });
studentSchema.index({ schoolId: 1, gradeLevel: 1 });
studentSchema.index({ classId: 1 });
studentSchema.index({ 'guardians.userId': 1 });
studentSchema.index({ studentId: 1 }, { unique: true });
studentSchema.index({ enrollmentStatus: 1 });

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

studentSchema.virtual('age').get(function () {
  if (!this.userId?.dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(this.userId.dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
});

// ─── Pre-save: Track status changes ──────────────────
studentSchema.pre('save', function (next) {
  if (this.isModified('enrollmentStatus')) {
    this.statusHistory.push({
      status: this.enrollmentStatus,
      date: new Date(),
      changedBy: this.updatedBy,
    });
  }
  next();
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;