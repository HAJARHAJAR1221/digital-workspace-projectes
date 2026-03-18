import { Router } from "express";
import { body } from "express-validator";
import { authenticate, authorizeRoles } from "../middleware/auth.js";
import { createTask, deleteTask, getTaskById, getTasks, updateTask } from "../controllers/taskController.js";

const router = Router();

router.use(authenticate);

router.get("/", getTasks);
router.get("/:id", getTaskById);

router.post(
  "/",
  authorizeRoles("admin", "manager"),
  [
    body("title").isString().trim().notEmpty(),
    body("description").optional().isString(),
    body("projectId").isString().notEmpty(),
    body("assignedTo").isString().notEmpty(),
    body("deadline").optional().isISO8601(),
    body("status").optional().isIn(["To Do", "In Progress", "Done"]),
    body("progress").optional().isFloat({ min: 0, max: 100 })
  ],
  createTask
);

router.patch(
  "/:id",
  [
    body("title").optional().isString().trim().notEmpty(),
    body("description").optional().isString(),
    body("deadline").optional().isISO8601(),
    body("status").optional().isIn(["To Do", "In Progress", "Done"]),
    body("progress").optional().isFloat({ min: 0, max: 100 })
  ],
  updateTask
);

router.delete("/:id", authorizeRoles("admin", "manager"), deleteTask);

export default router;

