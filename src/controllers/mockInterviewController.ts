import { Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MockInterview, IMessage } from "../models/MockInterview";
import { AuthRequest } from "../middleware/authMiddleware";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

function buildTranscript(messages: IMessage[]): string {
  return messages
    .map((m) => `${m.role === "interviewer" ? "Interviewer" : "Candidate"}: ${m.content}`)
    .join("\n");
}

export async function startInterview(req: AuthRequest, res: Response) {
  try {
    if (!genAI) {
      return res.status(500).json({ message: "AI service not configured" });
    }

    const { type } = req.body;
    if (!["DSA", "HR", "SystemDesign"].includes(type)) {
      return res.status(400).json({ message: "Invalid interview type" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

    const openingPrompt = `You are conducting ${getInterviewContext(type)} for a software engineering candidate.
Ask ONE opening question appropriate for this interview type. Be direct and professional, like a real interviewer.
Respond with ONLY the question text, nothing else — no preamble, no markdown.`;

    const result = await model.generateContent(openingPrompt);
    const firstQuestion = result.response.text().trim();

    const interview = await MockInterview.create({
      userId: req.userId,
      type,
      status: "in-progress",
      messages: [
        { role: "interviewer", content: firstQuestion, timestamp: new Date() },
      ],
    });

    res.status(201).json({ interviewId: interview.id, question: firstQuestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function respondToInterview(req: AuthRequest, res: Response) {
  try {
    if (!genAI) {
      return res.status(500).json({ message: "AI service not configured" });
    }

    const { interviewId, answer } = req.body;
    if (!interviewId || !answer) {
      return res.status(400).json({ message: "interviewId and answer are required" });
    }

    const interview = await MockInterview.findOne({
      _id: interviewId,
      userId: req.userId,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    if (interview.status === "completed") {
      return res.status(400).json({ message: "This interview has already ended" });
    }

    // Record the candidate's answer
    interview.messages.push({
      role: "candidate",
      content: answer,
      timestamp: new Date(),
    });

    const transcript = buildTranscript(interview.messages);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

    const prompt = `You are conducting ${getInterviewContext(interview.type)}. Here is the conversation so far:

${transcript}

Based on the candidate's last answer, respond as the interviewer would: either ask a natural follow-up question,
push deeper on their answer, or move to the next topic. Keep it to ONE question or response, professional and direct.
Respond with ONLY your response text, no preamble, no markdown.`;

    const result = await model.generateContent(prompt);
    const nextQuestion = result.response.text().trim();

    interview.messages.push({
      role: "interviewer",
      content: nextQuestion,
      timestamp: new Date(),
    });

    await interview.save();

    res.status(200).json({ question: nextQuestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function endInterview(req: AuthRequest, res: Response) {
  try {
    if (!genAI) {
      return res.status(500).json({ message: "AI service not configured" });
    }

    const { interviewId } = req.body;

    const interview = await MockInterview.findOne({
      _id: interviewId,
      userId: req.userId,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const transcript = buildTranscript(interview.messages);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

    const evalPrompt = `You are evaluating a completed interview (${getInterviewContext(interview.type)}). Full transcript:

${transcript}

Respond ONLY with valid JSON, no markdown, in exactly this shape:
{
  "score": number from 0-100,
  "strengths": ["short bullet points"],
  "weaknesses": ["short bullet points"],
  "summary": "2-3 sentence overall assessment"
}`;

    const result = await model.generateContent(evalPrompt);
    const cleaned = result.response.text().replace(/```json|```/g, "").trim();

    let evaluation;
    try {
      evaluation = JSON.parse(cleaned);
    } catch {
      return res.status(502).json({ message: "AI returned an unparseable evaluation" });
    }

    interview.status = "completed";
    interview.finalEvaluation = evaluation;
    await interview.save();

    res.status(200).json({ evaluation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

function getInterviewContext(type: string): string {
  switch (type) {
    case "HR":
      return "a behavioral/HR interview, focused on past experiences, teamwork, conflict resolution, and motivation — not technical coding questions";
    case "SystemDesign":
      return "a system design interview, focused on architecture, scalability, and trade-offs for a real-world system";
    default:
      return "a technical DSA (data structures & algorithms) interview";
  }
}