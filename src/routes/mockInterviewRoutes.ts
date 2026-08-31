import express from "express";
import { startInterview, respondToInterview, endInterview } from "../controllers/mockInterviewController";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/start", requireAuth, startInterview);
router.post("/respond", requireAuth, respondToInterview);
router.post("/end", requireAuth, endInterview);

export default router;