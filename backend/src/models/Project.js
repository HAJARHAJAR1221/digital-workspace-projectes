import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["En cours", "Terminé", "Retard"],
      default: "En cours"
    },
    priority: {
      type: String,
      enum: ["Haute", "Moyenne", "Basse"],
      default: "Moyenne"
    },
    deadline: { type: Date, required: false },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", projectSchema);

