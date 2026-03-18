import { validationResult } from "express-validator";
import { Message } from "../models/Message.js";
import { Project } from "../models/Project.js";
import { Activity } from "../models/Activity.js";

async function ensureUserInProject(userId, projectId) {
  const project = await Project.findById(projectId);
  if (!project) return null;
  const isManager = project.managerId?.toString() === userId;
  const isMember = project.members?.some((m) => m.toString() === userId);
  if (isManager || isMember) return project;
  return null;
}

export const getMessagesForProject = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    const project = await ensureUserInProject(req.user.id, projectId);
    if (!project) {
      return res.status(403).json({ message: "Vous n'avez pas accès aux messages de ce projet" });
    }
    const messages = await Message.find({ projectId }).sort({ createdAt: 1 });
    return res.json(messages);
  } catch (err) {
    return next(err);
  }
};

export const addMessageToProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const projectId = req.params.projectId;
    const project = await ensureUserInProject(req.user.id, projectId);
    if (!project) {
      return res.status(403).json({ message: "Vous n'avez pas accès pour envoyer des messages dans ce projet" });
    }

    const { content } = req.body;
    const msg = await Message.create({
      projectId,
      userId: req.user.id,
      userName: req.user.name || req.user.email,
      content
    });

    // Log activity
    try {
      await Activity.create({
        userId: req.user.id,
        projectId,
        type: "message_posted",
        description: `Message publié sur le projet`,
        metadata: {
          messageId: msg._id,
          contentPreview: content.slice(0, 120)
        }
      });
    } catch (activityErr) {
      console.error("Failed to record activity for message creation:", activityErr);
    }

    return res.status(201).json(msg);
  } catch (err) {
    return next(err);
  }
};

