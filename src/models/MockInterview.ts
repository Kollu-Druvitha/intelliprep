import mongoose, { Schema, Document, Types } from "mongoose";

export type InterviewType = "DSA" | "HR" | "SystemDesign";
export type MessageRole = "interviewer" | "candidate";

export interface IMessage {
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface IMockInterview extends Document {
  userId: Types.ObjectId;
  type: InterviewType;
  status: "in-progress" | "completed";
  messages: IMessage[];
  finalEvaluation?: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    summary: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    role: {
      type: String,
      enum: ["interviewer", "candidate"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // messages don't need their own separate ID
);

const mockInterviewSchema = new Schema<IMockInterview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["DSA", "HR", "SystemDesign"],
      required: true,
    },
    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    finalEvaluation: {
      score: { type: Number },
      strengths: { type: [String] },
      weaknesses: { type: [String] },
      summary: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

export const MockInterview = mongoose.model<IMockInterview>(
  "MockInterview",
  mockInterviewSchema
);