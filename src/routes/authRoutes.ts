import express from "express";
import passport from "passport";
import { signup, login, getMe, refresh } from "../controllers/authController";
import { requireAuth } from "../middleware/authMiddleware";
import { generateAccessToken, generateRefreshToken } from "../Utils/generateTokens";
import { IUser } from "../models/User";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", requireAuth, getMe);
router.post("/refresh", refresh);

// Step 1: kick off the Google OAuth flow
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// Step 2: Google redirects back here after user approves
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user as IUser;
    const userId = user._id.toString();
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    // For now, just return tokens as JSON — later the frontend will handle this via redirect + query params
    res.status(200).json({
      user: { id: userId, name: user.name, email: user.email },
      accessToken,
      refreshToken,
    });
  }
);

export default router;