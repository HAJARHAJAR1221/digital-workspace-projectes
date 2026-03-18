import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { User } from "./models/User.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart_workspace";
const DEMO_PASSWORD = "demo";

const demoUsers = [
  { name: "Sarah Admin", email: "admin@agency.com", role: "admin", avatar: "SA" },
  { name: "Marc Manager", email: "manager@agency.com", role: "manager", avatar: "MM" },
  { name: "David Dev", email: "dev@agency.com", role: "developer", avatar: "DD" },
  { name: "Diana Design", email: "designer@agency.com", role: "designer", avatar: "DG" }
];

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    const hashed = await bcrypt.hash(DEMO_PASSWORD, 10);
    for (const u of demoUsers) {
      await User.findOneAndUpdate(
        { email: u.email },
        {
          name: u.name,
          email: u.email,
          password: hashed,
          role: u.role,
          avatar: u.avatar,
          status: "active"
        },
        { upsert: true, new: true }
      );
    }
    console.log("Demo users seeded (password for all: demo)");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
