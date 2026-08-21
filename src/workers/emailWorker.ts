import { Worker } from "bullmq";
import redis from "../config/redis";
import { sendWeeklyReportEmail } from "../services/emailService";

export const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    const { to, name, solvedCount, topics } = job.data;
    console.log(`Processing email job for ${to}`);
    await sendWeeklyReportEmail(to, name, solvedCount, topics);
  },
  { connection: redis }
);

emailWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});