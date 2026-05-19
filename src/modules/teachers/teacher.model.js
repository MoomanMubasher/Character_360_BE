// BACKEND/src/modules/teachers/teacher.model.js

import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
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
      required: [true, 'School is required'],
      // Removed: index: true
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    designation: {
      type: String,
      enum: ['teacher', 'senior_teacher', 'lead_teacher', 'teaching_assistant', 'substitute_teacher'],
      default: 'teacher',
    },
    subjects: [
      {
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
        subjectName: { type: String },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    gradeLevels: [{ type: String }],
    classAssignments: [
      {
        classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
        role: {
          type: String,
          enum: ['class_teacher', 'subject_teacher', 'assistant'],
          default: 'subject_teacher',
        },
        assignedDate: { type: Date, default: Date.now },
      },
    ],
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    certifications: [
      {
        name: { type: String },
        issuingAuthority: { type: String },
        dateIssued: { type: Date },
        expiryDate: { type: Date },
        certificateNumber: { type: String },
        state: { type: String, default: 'Michigan' },
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
    specializations: [{ type: String }],
    dateOfJoining: {
      type: Date,
      required: [true, 'Date of joining is required'],
    },
    dateOfLeaving: { type: Date, default: null },
    yearsOfExperience: { type: Number, min: 0 },
    contractType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'substitute', 'intern'],
      default: 'full_time',
    },
    previousEmployment: [
      {
        organization: { type: String },
        position: { type: String },
        fromDate: { type: Date },
        toDate: { type: Date },
      },
    ],
    maxClassesPerDay: { type: Number, default: 6 },
    maxClassesPerWeek: { type: Number, default: 30 },
    availablePeriods: [
      {
        day: {
          type: String,
          enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        },
        periods: [{ type: Number }],
      },
    ],
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String },
      email: { type: String },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave', 'transferred', 'terminated', 'suspended'],
      default: 'active',
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },

    // ─── Teacher Preferences / Settings ─────────────
    preferences: {
      teaching: {
        defaultGradingScale: { type: String, default: 'percentage' },
        gradingWeights: {
          assignments: { type: Number, default: 40 },
          exams: { type: Number, default: 40 },
          classwork: { type: Number, default: 20 },
        },
        autoPublishGrades: { type: Boolean, default: false },
        allowLateSubmissions: { type: Boolean, default: true },
        notifyOnSubmission: { type: Boolean, default: true },
        defaultLessonDuration: { type: Number, default: 50 },
        showGradeBreakdown: { type: Boolean, default: true },
      },
      notifications: {
        classNotifications: {
          newStudent: { type: Boolean, default: true },
          studentAbsent: { type: Boolean, default: true },
          assignmentDue: { type: Boolean, default: true },
          examReminder: { type: Boolean, default: true },
          gradeSubmitted: { type: Boolean, default: false },
          parentMessage: { type: Boolean, default: true },
        },
        scheduling: {
          classReminder: { type: Boolean, default: true },
          substituteRequest: { type: Boolean, default: true },
          timetableChange: { type: Boolean, default: true },
          holidayAlert: { type: Boolean, default: true },
          meetingReminder: { type: Boolean, default: true },
        },
        studentProgress: {
          lowGradeAlert: { type: Boolean, default: true },
          attendanceAlert: { type: Boolean, default: true },
          behaviorReport: { type: Boolean, default: false },
          progressReport: { type: Boolean, default: true },
        },
      },
      assessment: {
        defaultGradeView: { type: String, default: 'list' },
        defaultGradeScale: { type: String, default: 'standard' },
        showBreakdown: { type: Boolean, default: true },
        assignmentWeights: {
          homework: { type: Number, default: 20 },
          classwork: { type: Number, default: 20 },
          project: { type: Number, default: 20 },
          exam: { type: Number, default: 40 },
        },
        autoPublishAssignments: { type: Boolean, default: false },
        defaultSubmissionType: { type: String, default: 'any' },
        defaultDueDays: { type: Number, default: 7 },
        allowedFileTypes: [{ type: String }],
      },
      classroom: {
        allowStudentGroups: { type: Boolean, default: true },
        randomizeGroups: { type: Boolean, default: false },
        trackGroupProgress: { type: Boolean, default: true },
        peerAssessment: { type: Boolean, default: false },
        defaultGroupSize: { type: Number, default: 4 },
        hallPassRequireReason: { type: Boolean, default: true },
        hallPassDuration: { type: Number, default: 5 },
        allowComments: { type: Boolean, default: true },
        allowReactions: { type: Boolean, default: true },
        allowPinning: { type: Boolean, default: true },
      },
      privacy: {
        showContactInfo: { type: Boolean, default: true },
        showSchedule: { type: Boolean, default: true },
        allowStudentMessages: { type: Boolean, default: true },
        allowParentMessages: { type: Boolean, default: true },
        showInDirectory: { type: Boolean, default: true },
        shareGradesWithParents: { type: Boolean, default: true },
        shareAttendanceWithParents: { type: Boolean, default: true },
        anonymizeInReports: { type: Boolean, default: false },
        trackingConsent: { type: Boolean, default: true },
        dataRetentionAck: { type: Boolean, default: false },
      },
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
teacherSchema.index({ districtId: 1, schoolId: 1 });
teacherSchema.index({ status: 1 });
teacherSchema.index({ 'classAssignments.classId': 1 });
teacherSchema.index({ 'subjects.subjectId': 1 });
// userId already indexed via unique: true

teacherSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

teacherSchema.virtual('school', {
  ref: 'School',
  localField: 'schoolId',
  foreignField: '_id',
  justOne: true,
});

const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher;