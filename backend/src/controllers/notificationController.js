import { Notification } from "../models/Notification.js";

export const getNotificationsForUser = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json(notifications);
  } catch (err) {
    return next(err);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOne({ _id: req.params.id, userId: req.user.id });
    if (!notif) {
      return res.status(404).json({ message: "Notification non trouvée" });
    }
    notif.read = true;
    await notif.save();
    return res.json(notif);
  } catch (err) {
    return next(err);
  }
};

