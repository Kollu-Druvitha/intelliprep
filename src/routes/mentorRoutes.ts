import express from "express";
import { reviewCode } from "../controllers/mentorController";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/review", requireAuth, reviewCode);

export default router;