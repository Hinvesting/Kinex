import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();

// Middleware
app.use(express.json());
app.use(morgan("dev"));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Health
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "kinex-api" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/upload", uploadRoutes);

const PORT = Number(process.env.PORT || 5000);

// Start server after DB connects
connectDB(process.env.MONGODB_URI || "mongodb://localhost:27017/kinex").then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
});
