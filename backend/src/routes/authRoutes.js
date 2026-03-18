import { Router } from "express";
import { body } from "express-validator";
import { login, me, register } from "../controllers/authController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = Router();

router.post(
  "/register",
  authenticate,
  authorizeRoles("admin"),
  [
    body("name").isString().trim().notEmpty(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("role").isIn(["admin", "manager", "developer", "designer"])
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 1 })
  ],
  login
);

router.get("/me", authenticate, me);

export default router;

