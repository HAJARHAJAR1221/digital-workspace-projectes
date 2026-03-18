import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    content: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);

