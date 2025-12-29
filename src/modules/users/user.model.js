import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true
    },
    role: {
      type: String,
      required: true
    },
    email: {
      type: String,
      unique: true,
      lowercase: true
    },
    password: String,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
