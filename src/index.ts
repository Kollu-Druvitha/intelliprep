import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
//import dotenv from "dotenv";
import githubRoutes from "./routes/githubRoutes";
import passport from "./config/passport";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import problemRoutes from "./routes/problemRoutes";
import activityRoutes from "./routes/activityRoutes";

//dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/github", githubRoutes);
app.use(passport.initialize());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

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

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

startServer();