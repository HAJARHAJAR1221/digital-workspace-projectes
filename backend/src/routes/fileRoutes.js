import { Router } from "express";
import { body } from "express-validator";
import multer from "multer";
import { authenticate, authorizeRoles } from "../middleware/auth.js";
import { getFilesForProject, uploadFile } from "../controllers/fileController.js";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = file.originalname.split(".").pop();
    cb(null, `${unique}.${ext}`);
  }
});

const upload = multer({ storage });

router.use(authenticate);

// Legacy/project-scoped routes
router.get("/projects/:projectId", getFilesForProject);

// Upload de fichier (multipart/form-data avec champ "file")
router.post(
  "/projects/:projectId",
  authorizeRoles("admin", "manager", "designer", "developer"),
  upload.single("file"),
  [
    body("type").isIn(["image", "video", "document"]),
    body("category").optional().isString()
  ],
  uploadFile
);

// Aliases matching /api/files?projectId=...
router.get("/", (req, res, next) => {
  if (!req.query.projectId) {
    return res.status(400).json({ message: "projectId query parameter requis" });
  }
  req.params.projectId = String(req.query.projectId);
  return getFilesForProject(req, res, next);
});

router.post(
  "/",
  authorizeRoles("admin", "manager", "designer", "developer"),
  upload.single("file"),
  [
    body("type").isIn(["image", "video", "document"]),
    body("category").optional().isString(),
    body("projectId").isString().notEmpty()
  ],
  (req, res, next) => {
    req.params.projectId = String(req.body.projectId);
    return uploadFile(req, res, next);
  }
);

export default router;


