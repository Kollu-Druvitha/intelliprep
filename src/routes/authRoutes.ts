import express from "express";
import { signup, login, getMe, refresh } from "../controllers/authController";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", requireAuth, getMe);
router.post("/refresh", refresh);

export default router;