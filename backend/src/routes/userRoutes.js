import { Router } from "express";
import { body } from "express-validator";
import { authenticate, authorizeRoles } from "../middleware/auth.js";
import { createUser, deleteUser, getUserById, getUsers, updateUser } from "../controllers/userController.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("admin", "manager"));

router.get("/", getUsers);
router.get("/:id", getUserById);

router.post(
  "/",
  [
    body("name").isString().trim().notEmpty(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("role").isIn(["admin", "manager", "developer", "designer"]),
    body("status").optional().isIn(["active", "inactive"])
  ],
  createUser
);

router.patch(
  "/:id",
  [
    body("name").optional().isString().trim().notEmpty(),
    body("email").optional().isEmail().normalizeEmail(),
    body("role").optional().isIn(["admin", "manager", "developer", "designer"]),
    body("status").optional().isIn(["active", "inactive"]),
    body("password").optional().isLength({ min: 6 })
  ],
  updateUser
);

router.delete("/:id", deleteUser);

export default router;

