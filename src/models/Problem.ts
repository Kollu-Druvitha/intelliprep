import mongoose, { Schema, Document } from "mongoose";

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface IProblem extends Document {
  title: string;
  difficulty: Difficulty;
  topics: string[];
  externalUrl?: string;
  source?: "LeetCode" | "CodeChef" | "Custom";
  createdAt: Date;
  updatedAt: Date;
}

const problemSchema = new Schema<IProblem>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    topics: {
      type: [String],
      required: true,
      default: [],
    },
    externalUrl: {
      type: String,
    },
    source: {
      type: String,
      enum: ["LeetCode", "CodeChef", "Custom"],
      default: "Custom",
    },
  },
  {
    timestamps: true,
  }
);

export const Problem = mongoose.model<IProblem>("Problem", problemSchema);