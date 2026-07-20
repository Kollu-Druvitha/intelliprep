import express from "express";
import { getProfile, updateProfile } from "../controllers/userController";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/me", requireAuth, getProfile);
router.patch("/me", requireAuth, updateProfile);

export default router;