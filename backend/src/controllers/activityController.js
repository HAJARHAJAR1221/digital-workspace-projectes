import { Activity } from "../models/Activity.js";

export const getActivities = async (req, res, next) => {
  try {
    const { userId, projectId, taskId, limit = 50 } = req.query;
    const query = {};

    if (userId) {
      query.userId = userId;
    }
    if (projectId) {
      query.projectId = projectId;
    }
    if (taskId) {
      query.taskId = taskId;
    }

    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    return res.json(activities);
  } catch (err) {
    return next(err);
  }
};

