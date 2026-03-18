import { Router } from "express";
import { body } from "express-validator";
import { authenticate, authorizeRoles } from "../middleware/auth.js";
import { createProject, deleteProject, getProjectById, getProjects, updateProject } from "../controllers/projectController.js";

const router = Router();

router.use(authenticate);

router.get("/", getProjects);
router.get("/:id", getProjectById);

router.post(
  "/",
  authorizeRoles("admin", "manager"),
  [
    body("name").isString().trim().notEmpty(),
    body("description").optional().isString(),
    body("status").optional().isIn(["En cours", "Terminé", "Retard"]),
    body("priority").optional().isIn(["Haute", "Moyenne", "Basse"])
  ],
  createProject
);

router.patch(
  "/:id",
  authorizeRoles("admin", "manager"),
  [
    body("name").optional().isString().trim().notEmpty(),
    body("description").optional().isString(),
    body("status").optional().isIn(["En cours", "Terminé", "Retard"]),
    body("priority").optional().isIn(["Haute", "Moyenne", "Basse"]),
    body("progress").optional().isFloat({ min: 0, max: 100 }),
    body("members").optional().isArray(),
    body("members.*").optional().isMongoId()
  ],
  updateProject
);

router.delete("/:id", authorizeRoles("admin"), deleteProject);

export default router;

