import { Router } from "express";
import { authenticate, authorizeRoles } from "../middleware/auth.js";
import { getIntelligentAlerts } from "../controllers/intelligenceController.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("admin", "manager"));

router.get("/alerts", getIntelligentAlerts);

export default router;

