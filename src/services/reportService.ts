import mongoose from "mongoose";
import { Activity } from "../models/Activity";
import { User } from "../models/User";
import { emailQueue } from "../queues/emailQueue";

export async function generateAndSendWeeklyReports() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const users = await User.find({ email: { $exists: true } });

  for (const user of users) {
    const activities = await Activity.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(user.id),
          status: "Solved",
          solvedAt: { $gte: oneWeekAgo },
        },
      },
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
      { $group: { _id: "$problem.topics" } },
    ]);

    const solvedCount = await Activity.countDocuments({
      userId: user.id,
      status: "Solved",
      solvedAt: { $gte: oneWeekAgo },
    });

    const topics = activities.map((a) => a._id);

    try {
      await emailQueue.add("send-weekly-report", {
        to: user.email,
        name: user.name,
        solvedCount,
        topics,
        userId: user.id,
      });
      console.log(`Enqueued weekly report job for ${user.email}`);
    } catch (err) {
      console.error(`Failed to enqueue report for ${user.email}:`, err);
    }
  }
}