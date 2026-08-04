import express from "express";
import { getGithubStats } from "../controllers/githubController";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", requireAuth, getGithubStats);

export default router;