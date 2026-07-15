import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(express.json());

app.get("/db-check", async (req, res) => {
  const state = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
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