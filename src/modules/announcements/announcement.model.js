// BACKEND/src/modules/announcements/announcement.model.js

import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    body: {
      type: String,
      required: [true, 'Announcement body is required'],
    },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    // Scope: class-level or school-wide
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      default: null,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      default: null,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    category: {
      type: String,
      enum: ['general', 'assignment', 'exam', 'event', 'holiday', 'urgent', 'reminder'],
      default: 'general',
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },

    // Audience targeting
    audience: {
      type: String,
      enum: ['class', 'school', 'district', 'all'],
      default: 'class',
    },
    targetRoles: [{ type: String }], // Empty = all roles in scope

    // Pin / scheduling
    isPinned: { type: Boolean, default: false },
    pinnedAt: { type: Date, default: null },
    publishAt: { type: Date, default: null }, // Future scheduling (null = immediate)
    expiresAt: { type: Date, default: null },

    // Attachments
    attachments: [
      {
        fileName: { type: String },
        fileUrl: { type: String },
        fileType: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Engagement
    allowComments: { type: Boolean, default: true },
    allowReactions: { type: Boolean, default: true },
    viewCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
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

announcementSchema.index({ schoolId: 1, status: 1, createdAt: -1 });
announcementSchema.index({ classId: 1, status: 1 });
announcementSchema.index({ authorId: 1 });
announcementSchema.index({ isPinned: 1, schoolId: 1 });

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
