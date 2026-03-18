import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    return res.json(users);
  } catch (err) {
    return next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    return res.json(user);
  } catch (err) {
    return next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, status } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Un utilisateur avec cet email existe déjà" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role,
      status
    });

    const { password: _pw, ...safeUser } = user.toObject();
    return res.status(201).json(safeUser);
  } catch (err) {
    return next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Managers cannot change role of admins
    if (req.user.role === "manager" && user.role === "admin") {
      return res.status(403).json({ message: "Vous ne pouvez pas modifier un administrateur" });
    }

    const { name, email, role, status, password } = req.body;
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (role) user.role = role;
    if (status) user.status = status;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    const { password: _pw, ...safeUser } = user.toObject();
    return res.json(safeUser);
  } catch (err) {
    return next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    if (user.role === "admin") {
      return res.status(403).json({ message: "Vous ne pouvez pas supprimer un administrateur" });
    }
    await user.deleteOne();
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

