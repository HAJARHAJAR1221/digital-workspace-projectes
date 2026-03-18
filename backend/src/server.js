import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import intelligenceRoutes from "./routes/intelligenceRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load .env from backend/src/.env or backend/.env
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart_workspace";
const PORT = process.env.PORT || 5001;

const app = express();

app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : [])
];
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Static serving for uploaded files
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// API routes (frontend expects base path /api)
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/intelligence", intelligenceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/activities", activityRoutes);

app.use(errorHandler);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Connect to MongoDB then start server so login works
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("   Make sure MongoDB is running and MONGO_URI is correct.");
    console.error("   To create a login user, run: npm run seed");
    process.exit(1);
  });