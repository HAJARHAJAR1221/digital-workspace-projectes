import { validationResult } from "express-validator";
import { Comment } from "../models/Comment.js";
import { Activity } from "../models/Activity.js";

export const getCommentsForTask = async (req, res, next) => {
  try {
    const comments = await Comment.find({ taskId: req.params.taskId }).sort({ createdAt: 1 });
    return res.json(comments);
  } catch (err) {
    return next(err);
  }
};

export const addCommentToTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content } = req.body;
    const comment = await Comment.create({
      taskId: req.params.taskId,
      userId: req.user.id,
      userName: req.user.name || req.user.email,
      content
    });

    // Log activity
    try {
      await Activity.create({
        userId: req.user.id,
        taskId: req.params.taskId,
        type: "comment_added",
        description: `Commentaire ajouté à une tâche`,
        metadata: {
          commentId: comment._id,
          contentPreview: content.slice(0, 120)
        }
      });
    } catch (activityErr) {
      console.error("Failed to record activity for comment creation:", activityErr);
    }

    return res.status(201).json(comment);
  } catch (err) {
    return next(err);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire non trouvé" });
    }
    if (req.user.role !== "admin" && comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Vous ne pouvez supprimer que vos commentaires" });
    }
    await comment.deleteOne();
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

