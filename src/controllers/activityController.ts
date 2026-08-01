import { Response } from "express";
import { Activity } from "../models/Activity";
import { AuthRequest } from "../middleware/authMiddleware";

export async function logActivity(req: AuthRequest, res: Response) {
  try {
    const { problemId, status, timeTakenMinutes, notes } = req.body;

    if (!problemId || !status) {
      return res.status(400).json({ message: "problemId and status are required" });
    }

    const activity = await Activity.create({
      userId: req.userId,
      problemId,
      status,
      timeTakenMinutes,
      notes,
    });

    res.status(201).json({ activity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getMyActivity(req: AuthRequest, res: Response) {
  try {
    const activities = await Activity.find({ userId: req.userId })
      .populate("problemId")
      .sort({ solvedAt: -1 });

    res.status(200).json({ activities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}