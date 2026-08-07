import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";

export async function analyzeResume(req: AuthRequest, res: Response) {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        message: "resumeText and jobDescription are required",
      });
    }

    const aiServiceUrl = process.env.AI_SERVICE_URL;
    if (!aiServiceUrl) {
      return res.status(500).json({ message: "AI service not configured" });
    }

    const response = await fetch(`${aiServiceUrl}/score-resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume_text: resumeText,
        job_description: jobDescription,
      }),
    });

    if (!response.ok) {
      console.error("AI service error:", response.status, await response.text());
      return res.status(502).json({ message: "Failed to analyze resume" });
    }

    const result = await response.json();

    res.status(200).json({
      matchScore: result.matchScore,
      missingKeywords: result.missingKeywords,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}