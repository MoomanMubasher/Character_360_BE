// BACKEND/src/modules/library/book.model.js

import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true },
    isbn: { type: String, unique: true, sparse: true },
    publisher: { type: String },
    publishYear: { type: Number },
    edition: { type: String },
    description: { type: String },

    districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },

    category: {
      type: String,
      enum: [
        'fiction', 'non_fiction', 'textbook', 'reference',
        'biography', 'science', 'mathematics', 'history',
        'literature', 'arts', 'technology', 'periodical', 'other',
      ],
      default: 'other',
    },
    language: { type: String, default: 'English' },
    pages: { type: Number },
    coverImage: { type: String },

    // ─── Inventory ──────────────────────────────────
    totalCopies: { type: Number, default: 1 },
    availableCopies: { type: Number, default: 1 },
    location: {
      shelf: { type: String },
      row: { type: String },
      section: { type: String },
    },

    // ─── Lending ────────────────────────────────────
    isLendable: { type: Boolean, default: true },
    maxLendDays: { type: Number, default: 14 },
    finePerDay: { type: Number, default: 0.25 },

    // ─── Borrow History ─────────────────────────────
    borrowRecords: [
      {
        borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        borrowerType: { type: String, enum: ['student', 'teacher', 'staff'] },
        borrowDate: { type: Date },
        dueDate: { type: Date },
        returnDate: { type: Date },
        fineAmount: { type: Number, default: 0 },
        finePaid: { type: Boolean, default: false },
        condition: { type: String, enum: ['good', 'fair', 'damaged', 'lost'] },
        status: {
          type: String,
          enum: ['borrowed', 'returned', 'overdue', 'lost'],
          default: 'borrowed',
        },
      },
    ],

    status: {
      type: String,
      enum: ['available', 'all_borrowed', 'damaged', 'retired'],
      default: 'available',
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

bookSchema.index({ schoolId: 1, category: 1 });
bookSchema.index({ title: 'text', author: 'text' });
bookSchema.index({ status: 1 });

const Book = mongoose.model('Book', bookSchema);
export default Book;