import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
//import dotenv from "dotenv";
import githubRoutes from "./routes/githubRoutes";
import passport from "./config/passport";
import mentorRoutes from "./routes/mentorRoutes";
import roadmapRoutes from "./routes/roadmapRoutes";
import resumeRoutes from "./routes/resumeRoutes";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import problemRoutes from "./routes/problemRoutes";
import activityRoutes from "./routes/activityRoutes";


import http from "http";
import { Server } from "socket.io";

import "./workers/emailWorker";

import "./config/redis";

import cron from "node-cron";
import { generateAndSendWeeklyReports } from "./services/reportService";
//dotenv.config();

const app = express();
app.use(express.json());
app.use(passport.initialize());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/roadmap", roadmapRoutes);


const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/db-check", async (req, res) => {
  const state = mongoose.connection.readyState;
  res.json({ mongooseState: state });
});

async function startServer() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

startServer();

cron.schedule("0 9 * * 1", () => {
  console.log("Running weekly report job...");
  generateAndSendWeeklyReports();
});

app.get("/api/test-weekly-report", async (req, res) => {
  await generateAndSendWeeklyReports();
  res.json({ message: "Weekly report job triggered manually" });
});


// app.get("/api/test-weekly-report", async (req, res) => {
//   await generateAndSendWeeklyReports();
//   res.json({ message: "Weekly report job triggered manually" });
// });



const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*", // tighten this to your real frontend URL once it exists
  },
});

const userSocketMap = new Map<string, string>(); // userId -> socket.id

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("register", (userId: string) => {
    userSocketMap.set(userId, socket.id);
    console.log(`User ${userId} registered on socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
      }
    }
  });
});

export function notifyUser(userId: string, event: string, data: any) {
  const socketId = userSocketMap.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
}