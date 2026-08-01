import { Request, Response } from "express";
import { Problem } from "../models/Problem";

export async function getProblems(req: Request, res: Response) {
  try {
    const problems = await Problem.find().sort({ createdAt: -1 });
    res.status(200).json({ problems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}