// BACKEND/src/modules/users/user.model.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ─── Identity ───────────────────────────────────
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    middleName: {
      type: String,
      trim: true,
      maxlength: [50, 'Middle name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never return password in queries
    },
    phone: {
      type: String,
      trim: true,
    },

    // ─── Role & Access ──────────────────────────────
    roles: [
      {
        type: String,
        enum: [
          'super_admin',
          'district_admin',
          'school_admin',        // Principal
          'vice_principal',
          'office_admin',        // Secretary/Registrar
          'department_head',
          'teacher',
          'teaching_assistant',
          'counselor',
          'librarian',
          'nurse',
          'coach',
          'student',
          'parent',
          'board_member',
          'hr_manager',
          'hr_staff',
          'finance_manager',
          'finance_clerk',
          'payroll_specialist',
        ],
        required: true,
      },
    ],
    primaryRole: {
      type: String,
      required: [true, 'Primary role is required'],
    },
    permissions: [
      {
        type: String, // e.g., 'students:read', 'grades:write'
      },
    ],
    customPermissions: {
      granted: [{ type: String }], // Extra permissions beyond role defaults
      revoked: [{ type: String }], // Permissions removed from role defaults
    },

    // ─── Multi-Tenant Scoping ───────────────────────
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      index: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true,
    },

    // ─── Profile ────────────────────────────────────
    avatar: {
      type: String,
      default: null,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String, default: 'Michigan' },
      zipCode: { type: String },
      country: { type: String, default: 'USA' },
    },

    // ─── Account Status ─────────────────────────────
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'pending', 'archived'],
      default: 'pending',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },

    // ─── Metadata ───────────────────────────────────
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
userSchema.index({ districtId: 1, schoolId: 1 });
userSchema.index({ roles: 1 });
userSchema.index({ status: 1 });
userSchema.index({ email: 1 }, { unique: true });

// ─── Virtual: Full Name ──────────────────────────────
userSchema.virtual('fullName').get(function () {
  const middle = this.middleName ? ` ${this.middleName}` : '';
  return `${this.firstName}${middle} ${this.lastName}`;
});

// ─── Virtual: Profile References ─────────────────────
userSchema.virtual('teacherProfile', {
  ref: 'Teacher',
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
});

userSchema.virtual('studentProfile', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
});

userSchema.virtual('principalProfile', {
  ref: 'Principal',
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
});

// ─── Pre-save: Hash Password ─────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// ─── Methods ─────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.hasRole = function (role) {
  return this.roles.includes(role);
};

userSchema.methods.hasAnyRole = function (roles) {
  return roles.some((role) => this.roles.includes(role));
};

userSchema.methods.hasPermission = function (permission) {
  // Check if revoked first
  if (this.customPermissions?.revoked?.includes(permission)) return false;
  // Check granted custom permissions
  if (this.customPermissions?.granted?.includes(permission)) return true;
  // Check base permissions
  return this.permissions.includes(permission);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;