import { validationResult } from "express-validator";
import { Task } from "../models/Task.js";
import { Project } from "../models/Project.js";
import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";
import { Activity } from "../models/Activity.js";

const filterTasksByRole = async (tasks, user) => {
  if (!user) return tasks;
  if (user.role === "developer" || user.role === "designer") {
    return tasks.filter(t => t.assignedTo.toString() === user.id);
  }
  if (user.role === "manager") {
    const projectIds = await Project.find({ managerId: user.id }).distinct("_id");
    const idStrings = projectIds.map(id => id.toString());
    return tasks.filter(t => idStrings.includes(t.projectId.toString()));
  }
  return tasks;
};

export const getTasks = async (req, res, next) => {
  try {
    const all = await Task.find();
    const filtered = await filterTasksByRole(all, req.user);
    return res.json(filtered);
  } catch (err) {
    return next(err);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Tâche non trouvée" });
    }
    return res.json(task);
  } catch (err) {
    return next(err);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, projectId, assignedTo, deadline, status, progress } = req.body;
    const user = await User.findById(assignedTo);
    if (!user) {
      return res.status(400).json({ message: "Utilisateur assigné invalide" });
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo,
      assignedToName: user.name,
      deadline,
      status,
      progress
    });

    // Notification pour l'utilisateur assigné
    await Notification.create({
      userId: assignedTo,
      title: "Nouvelle tâche assignée",
      message: `${title} vous a été assignée`,
      type: "task"
    });

    // Log activity
    try {
      await Activity.create({
        userId: req.user.id,
        projectId,
        taskId: task._id,
        type: "task_created",
        description: `Tâche "${task.title}" créée`,
        metadata: {
          assignedTo: task.assignedTo,
          status: task.status,
          progress: task.progress
        }
      });
    } catch (activityErr) {
      console.error("Failed to record activity for task creation:", activityErr);
    }

    return res.status(201).json(task);
  } catch (err) {
    return next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Tâche non trouvée" });
    }

    if (req.user.role === "developer" || req.user.role === "designer") {
      if (task.assignedTo.toString() !== req.user.id) {
        return res.status(403).json({ message: "Vous ne pouvez modifier que vos tâches" });
      }
    }

    const prevAssignedTo = task.assignedTo.toString();
    const prevStatus = task.status;

    Object.assign(task, req.body);
    await task.save();

    // Notification si la tâche est réassignée
    if (req.body.assignedTo && req.body.assignedTo !== prevAssignedTo) {
      const newAssignee = await User.findById(req.body.assignedTo);
      if (newAssignee) {
        await Notification.create({
          userId: newAssignee._id,
          title: "Nouvelle tâche assignée",
          message: `${task.title} vous a été assignée`,
          type: "task"
        });
      }
    }

    // Notification si le statut change
    if (req.body.status && req.body.status !== prevStatus) {
      await Notification.create({
        userId: task.assignedTo,
        title: "Statut de tâche modifié",
        message: `${task.title} est passée à ${task.status}`,
        type: "status"
      });
    }

    // Log activity for update
    try {
      await Activity.create({
        userId: req.user.id,
        projectId: task.projectId,
        taskId: task._id,
        type: "task_updated",
        description: `Tâche "${task.title}" mise à jour`,
        metadata: {
          previousStatus: prevStatus,
          newStatus: task.status
        }
      });
    } catch (activityErr) {
      console.error("Failed to record activity for task update:", activityErr);
    }

    return res.json(task);
  } catch (err) {
    return next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Tâche non trouvée" });
    }
    await task.deleteOne();
    try {
      await Activity.create({
        userId: req.user.id,
        projectId: task.projectId,
        taskId: task._id,
        type: "task_deleted",
        description: `Tâche "${task.title}" supprimée`
      });
    } catch (activityErr) {
      console.error("Failed to record activity for task deletion:", activityErr);
    }
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

