import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ["admin", "manager", "developer", "designer"],
      default: "developer"
    },
    avatar: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);

