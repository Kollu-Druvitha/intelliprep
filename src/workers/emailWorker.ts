import { Worker } from "bullmq";
import redis from "../config/redis";
import { sendWeeklyReportEmail } from "../services/emailService";
import { notifyUser } from "../index";

export const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    const { to, name, solvedCount, topics, userId } = job.data;
    console.log(`Processing email job for ${to}`);
    await sendWeeklyReportEmail(to, name, solvedCount, topics);
  },
  { connection: redis }
);

emailWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
  const userId = job.data.userId;
  if (userId) {
    notifyUser(userId, "report-sent", {
      message: "Your weekly report has been sent to your email!",
    });
  }
});

emailWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});