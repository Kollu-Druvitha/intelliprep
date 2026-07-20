import { Response } from "express";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        githubUsername: user.githubUsername,
        leetcodeUsername: user.leetcodeUsername,
        codechefUsername: user.codechefUsername,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    // Allowlist: only these fields can ever be updated via this route
    const allowedFields = [
      "name",
      "avatarUrl",
      "githubUsername",
      "leetcodeUsername",
      "codechefUsername",
    ] as const;

    const updates: Record<string, string> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true, // return the updated document, not the pre-update one
      runValidators: true, // re-run schema validation on the update
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        githubUsername: user.githubUsername,
        leetcodeUsername: user.leetcodeUsername,
        codechefUsername: user.codechefUsername,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}