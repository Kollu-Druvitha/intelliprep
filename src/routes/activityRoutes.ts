import express from "express";
import { logActivity, getMyActivity } from "../controllers/activityController";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", requireAuth, logActivity);
router.get("/", requireAuth, getMyActivity);

export default router;