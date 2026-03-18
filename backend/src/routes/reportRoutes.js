import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { generateProjectPdf } from "../controllers/reportController.js";

const router = Router();

router.use(authenticate);

// Génère un PDF récapitulatif pour un projet
router.get("/projects/:id/pdf", generateProjectPdf);

export default router;

