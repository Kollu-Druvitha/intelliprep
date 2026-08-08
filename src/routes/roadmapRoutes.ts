import express from "express";
import { generateRoadmap } from "../controllers/roadmapController";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", requireAuth, generateRoadmap);

export default router;