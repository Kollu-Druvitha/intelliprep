import mongoose, { Schema, Document, Types } from "mongoose";

export interface IActivity extends Document {
  userId: Types.ObjectId;
  problemId: Types.ObjectId;
  status: "Solved" | "Attempted";
  timeTakenMinutes?: number;
  notes?: string;
  solvedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["Solved", "Attempted"],
      required: true,
    },
    timeTakenMinutes: {
      type: Number,
    },
    notes: {
      type: String,
    },
    solvedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Activity = mongoose.model<IActivity>("Activity", activitySchema);