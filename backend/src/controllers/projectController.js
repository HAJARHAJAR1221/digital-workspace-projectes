import { validationResult } from "express-validator";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { Notification } from "../models/Notification.js";
import { Activity } from "../models/Activity.js";

// Helper to filter projects based on role rules similar to frontend
const filterByRole = (projects, user) => {
  if (!user) return projects;
  if (user.role === "developer" || user.role === "designer") {
    return projects.filter(p => p.members.some(m => m.toString() === user.id));
  }
  if (user.role === "manager") {
    return projects.filter(p => p.managerId.toString() === user.id || p.members.some(m => m.toString() === user.id));
  }
  return projects;
};

export const getProjects = async (req, res, next) => {
  try {
    const all = await Project.find().populate("managerId", "name").populate("members", "name");
    const filtered = filterByRole(all, req.user);
    const withCounts = await Promise.all(
      filtered.map(async p => {
        const count = await Task.countDocuments({ projectId: p._id });
        return { ...p.toObject(), taskCount: count };
      })
    );
    return res.json(withCounts);
  } catch (err) {
    return next(err);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate("managerId", "name").populate("members", "name");
    if (!project) {
      return res.status(404).json({ message: "Projet non trouvé" });
    }
    return res.json(project);
  } catch (err) {
    return next(err);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const data = {
      ...req.body,
      managerId: req.body.managerId || req.user.id
    };

    const project = await Project.create(data);

    // Log activity
    try {
      await Activity.create({
        userId: req.user.id,
        projectId: project._id,
        type: "project_created",
        description: `Projet "${project.name}" créé`,
        metadata: {
          status: project.status,
          priority: project.priority,
          deadline: project.deadline
        }
      });
    } catch (activityErr) {
      // Activity logging must not break main flow
      console.error("Failed to record activity for project creation:", activityErr);
    }

    return res.status(201).json(project);
  } catch (err) {
    return next(err);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Projet non trouvé" });
    }

    if (req.user.role === "manager" && project.managerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Vous ne pouvez modifier que vos projets" });
    }

    const prevStatus = project.status;

    Object.assign(project, req.body);
    await project.save();

    // Notification si le statut a changé
    if (req.body.status && req.body.status !== prevStatus) {
      const recipients = [project.managerId, ...project.members];
      await Promise.all(
        recipients.map(userId =>
          Notification.create({
            userId,
            title: "Statut de projet modifié",
            message: `Le projet ${project.name} est passé à ${project.status}`,
            type: "status"
          })
        )
      );
    }

    // Log activity for update
    try {
      await Activity.create({
        userId: req.user.id,
        projectId: project._id,
        type: "project_updated",
        description: `Projet "${project.name}" mis à jour`,
        metadata: {
          previousStatus: prevStatus,
          newStatus: project.status
        }
      });
    } catch (activityErr) {
      console.error("Failed to record activity for project update:", activityErr);
    }

    return res.json(project);
  } catch (err) {
    return next(err);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Projet non trouvé" });
    }
    await Task.deleteMany({ projectId: project._id });
    await project.deleteOne();
    try {
      await Activity.create({
        userId: req.user.id,
        projectId: project._id,
        type: "project_deleted",
        description: `Projet "${project.name}" supprimé`
      });
    } catch (activityErr) {
      console.error("Failed to record activity for project deletion:", activityErr);
    }
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

