import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendWeeklyReportEmail(
  to: string,
  name: string,
  solvedCount: number,
  topicsPracticed: string[]
) {
  const topicsList =
    topicsPracticed.length > 0 ? topicsPracticed.join(", ") : "none this week";

  await transporter.sendMail({
    from: `"IntelliPrep" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your IntelliPrep Weekly Progress Report",
    html: `
      <h2>Hey ${name}, here's your week in review</h2>
      <p><strong>Problems solved this week:</strong> ${solvedCount}</p>
      <p><strong>Topics practiced:</strong> ${topicsList}</p>
      <p>Keep up the momentum — consistency matters more than volume.</p>
    `,
  });
}