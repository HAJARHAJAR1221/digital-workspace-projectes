import { validationResult } from "express-validator";
import { File } from "../models/File.js";
import { Activity } from "../models/Activity.js";

export const getFilesForProject = async (req, res, next) => {
  try {
    const files = await File.find({ projectId: req.params.projectId }).sort({ createdAt: -1 });
    return res.json(files);
  } catch (err) {
    return next(err);
  }
};

// Upload binaire via multer, plus métadonnées envoyées dans body
export const uploadFile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier fourni" });
    }

    const { type, category } = req.body;
    const name = req.file.originalname;
    const size = `${Math.round(req.file.size / 1024)} KB`;

    const file = await File.create({
      projectId: req.params.projectId,
      name,
      type,
      category,
      size,
      url: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
      uploadedByName: req.user.name || req.user.email
    });

    // Log activity
    try {
      await Activity.create({
        userId: req.user.id,
        projectId: req.params.projectId,
        type: "file_uploaded",
        description: `Fichier "${name}" téléversé`,
        metadata: {
          fileId: file._id,
          type,
          size
        }
      });
    } catch (activityErr) {
      console.error("Failed to record activity for file upload:", activityErr);
    }

    return res.status(201).json(file);
  } catch (err) {
    return next(err);
  }
};

