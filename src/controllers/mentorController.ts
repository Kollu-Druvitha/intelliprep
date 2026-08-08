import { Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AuthRequest } from "../middleware/authMiddleware";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function reviewCode(req: AuthRequest, res: Response) {
  try {
    const { code, language } = req.body;

    if (!code) {
      return res.status(400).json({ message: "code is required" });
    }

    if (!genAI) {
      return res.status(500).json({ message: "AI service not configured" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

    const prompt = `You are a code reviewer helping a student prepare for technical interviews.
Review the following ${language || "code"} solution.

Respond ONLY with valid JSON, no markdown, no extra text, in exactly this shape:
{
  "timeComplexity": "string, e.g. O(n log n)",
  "spaceComplexity": "string, e.g. O(n)",
  "issues": ["short bullet points on bugs or edge cases missed"],
  "suggestions": ["short bullet points on how to optimize or improve"]
}

Code:
${code}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Gemini sometimes wraps JSON in markdown code fences despite instructions — strip them
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