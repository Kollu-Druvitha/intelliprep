import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { generateAccessToken, generateRefreshToken } from "../Utils/generateTokens";
import { AuthRequest } from "../middleware/authMiddleware";

export async function signup(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const user = await User.create({ name, email, password });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(200).json({
      user: { id: user.id, name: user.name, email: user.email },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
    if (!REFRESH_SECRET) {
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as unknown as {
      userId: string;
    };

    const newAccessToken = generateAccessToken(decoded.userId);

    res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
}