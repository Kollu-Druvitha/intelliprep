import express from "express";
import { logActivity, getMyActivity, getMyStats } from "../controllers/activityController";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", requireAuth, logActivity);
router.get("/", requireAuth, getMyActivity);
router.get("/stats", requireAuth, getMyStats);

export default router;