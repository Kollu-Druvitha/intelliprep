import { Response } from "express";
import { Activity } from "../models/Activity";
import { AuthRequest } from "../middleware/authMiddleware";
import mongoose from "mongoose";


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

export async function getMyStats(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;

    const statsByDifficulty = await Activity.aggregate([
      // Stage 1: only this user's activities, only ones marked Solved
      { $match: { userId: new mongoose.Types.ObjectId(userId), status: "Solved" } },

      // Stage 2: join with the Problem collection to get difficulty
      {
        $lookup: {
          from: "problems",
          localField: "problemId",
          foreignField: "_id",
          as: "problem",
        },
      },
      { $unwind: "$problem" },

      // Stage 3: group by difficulty, count how many in each
      {
        $group: {
          _id: "$problem.difficulty",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalSolved = await Activity.countDocuments({ userId, status: "Solved" });

    res.status(200).json({
      totalSolved,
      byDifficulty: statsByDifficulty,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}