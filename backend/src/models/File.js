import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["image", "video", "document"],
      required: true
    },
    category: { type: String, default: "" },
    size: { type: String, default: "" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    uploadedByName: { type: String, required: true },
    url: { type: String, required: true },
    version: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const File = mongoose.model("File", fileSchema);

