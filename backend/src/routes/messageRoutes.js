import { Router } from "express";
import { body } from "express-validator";
import { authenticate } from "../middleware/auth.js";
import { addMessageToProject, getMessagesForProject } from "../controllers/messageController.js";

const router = Router();

router.use(authenticate);

// Legacy/project-scoped routes
router.get("/projects/:projectId", getMessagesForProject);

router.post(
  "/projects/:projectId",
  [body("content").isString().trim().notEmpty()],
  addMessageToProject
);

// Aliases matching /api/messages?projectId=...
router.get("/", (req, res, next) => {
  if (!req.query.projectId) {
    return res.status(400).json({ message: "projectId query parameter requis" });
  }
  req.params.projectId = String(req.query.projectId);
  return getMessagesForProject(req, res, next);
});

router.post(
  "/",
  [body("content").isString().trim().notEmpty(), body("projectId").isString().notEmpty()],
  (req, res, next) => {
    req.params.projectId = String(req.body.projectId);
    return addMessageToProject(req, res, next);
  }
);

export default router;

