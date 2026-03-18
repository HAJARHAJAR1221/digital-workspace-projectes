import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";

export const getIntelligentAlerts = async (req, res, next) => {
  try {
    const projects = await Project.find();
    const tasks = await Task.find();
    const users = await User.find();

    const alerts = [];

    // Projets en retard (statut Retard ou deadline dépassée avec progression < 100)
    projects.forEach(p => {
      const isLate =
        p.status === "Retard" ||
        (p.deadline && new Date(p.deadline).getTime() < Date.now() && p.progress < 100);
      if (isLate) {
        alerts.push({
          id: `delay-${p._id}`,
          type: "delay",
          severity: "high",
          project: p.name,
          message: `Ce projet a une deadline dépassée ou un statut en retard. Progression à ${p.progress}%.`,
          suggestion: "Réévaluer la charge, prioriser les tâches critiques et ajuster les ressources."
        });
      }
    });

    // Développeurs surchargés : plus de 3 tâches non terminées
    users
      .filter(u => u.role === "developer")
      .forEach(u => {
        const activeTasks = tasks.filter(t => t.assignedTo.toString() === u._id.toString() && t.status !== "Done");
        if (activeTasks.length > 3) {
          alerts.push({
            id: `workload-${u._id}`,
            type: "workload",
            severity: "medium",
            project: u.name,
            message: `${u.name} a ${activeTasks.length} tâches actives.`,
            suggestion: "Redistribuer certaines tâches vers des membres moins chargés."
          });
        }
      });

    return res.json(alerts);
  } catch (err) {
    return next(err);
  }
};

