import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const ACCESS_SECRET = (process.env.JWT_ACCESS_SECRET || "dev-access-secret") as string;
const REFRESH_SECRET = (process.env.JWT_REFRESH_SECRET || "dev-refresh-secret") as string;

export function generateAccessToken(userId: string) {
  return jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: "15m" });
}

export function generateRefreshToken(userId: string) {
  return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: "7d" });
}
