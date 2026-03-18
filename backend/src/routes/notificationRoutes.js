import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { getNotificationsForUser, markNotificationRead } from "../controllers/notificationController.js";

const router = Router();

router.use(authenticate);

router.get("/", getNotificationsForUser);
router.patch("/:id/read", markNotificationRead);

export default router;

