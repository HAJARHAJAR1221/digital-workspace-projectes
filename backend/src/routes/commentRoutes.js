import { Router } from "express";
import { body } from "express-validator";
import { authenticate } from "../middleware/auth.js";
import { addCommentToTask, deleteComment, getCommentsForTask } from "../controllers/commentController.js";

const router = Router();

router.use(authenticate);

router.get("/tasks/:taskId", getCommentsForTask);

router.post(
  "/tasks/:taskId",
  [body("content").isString().trim().notEmpty()],
  addCommentToTask
);

router.delete("/:id", deleteComment);

export default router;

