import express from "express";
import { analyzeResume } from "../controllers/resumeController";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/analyze", requireAuth, analyzeResume);

export default router;