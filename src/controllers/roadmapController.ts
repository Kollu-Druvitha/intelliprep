import { Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Activity } from "../models/Activity";
import { AuthRequest } from "../middleware/authMiddleware";
import mongoose from "mongoose";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateRoadmap(req: AuthRequest, res: Response) {
  try {
    if (!genAI) {
      return res.status(500).json({ message: "AI service not configured" });
    }

    const userId = req.userId;

    // Get topic-wise solve counts, reusing the same aggregation pattern as getMyStats
    const topicStats = await Activity.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), status: "Solved" } },
      {
        $lookup: {
          from: "problems",
          localField: "problemId",
          foreignField: "_id",
          as: "problem",
        },
      },
      { $unwind: "$problem" },
      { $unwind: "$problem.topics" },
      {
        $group: {
          _id: "$problem.topics",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalSolved = await Activity.countDocuments({ userId, status: "Solved" });

    const statsText =
      topicStats.length > 0
        ? topicStats.map((t) => `${t._id}: ${t.count} solved`).join(", ")
        : "no problems solved yet";

    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

    const prompt = `You are helping a student prepare for technical coding interviews.

Their current progress: ${totalSolved} total problems solved.
Topic breakdown: ${statsText}

Based on this, generate a personalized study roadmap. Prioritize topics they haven't practiced or are weak in. Assume standard interview topic coverage is needed: Arrays, Strings, Hash Tables, Two Pointers, Sliding Window, Linked Lists, Trees, Graphs, Dynamic Programming, Backtracking, Heaps, Sorting/Searching.

Respond ONLY with valid JSON, no markdown, no extra text, in exactly this shape:
{
  "readinessNote": "one short sentence assessing current progress",
  "roadmap": [
    { "topic": "string", "priority": "High" | "Medium" | "Low", "reason": "short sentence why" }
  ]
}

Order the roadmap array by priority, highest first. Include 5-8 topics.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return res.status(502).json({ message: "AI returned an unparseable response" });
    }

    res.status(200).json(parsed);
  } catch (err: any) {
    console.error(err);

    if (err?.status === 429) {
      return res.status(429).json({
        message: "AI service rate limit reached. Please try again shortly.",
      });
    }

    res.status(500).json({ message: "Server error" });
  }
}