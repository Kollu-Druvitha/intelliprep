import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  avatarUrl?: string;
  githubUsername?: string;
  leetcodeUsername?: string;
  codechefUsername?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false, // never returned by default in queries
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // allows many docs to have no googleId without violating uniqueness
    },
    avatarUrl: {
      type: String,
    },
    githubUsername: {
      type: String,
    },
    leetcodeUsername: {
      type: String,
    },
    codechefUsername: {
      type: String,
    },
  },
  {
    timestamps: true, // auto-adds createdAt / updatedAt
  }
);

export const User = mongoose.model<IUser>("User", userSchema);