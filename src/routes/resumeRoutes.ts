import express from "express";
import multer from "multer";
import { analyzeResume, analyzeResumePdf } from "../controllers/resumeController";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/analyze", requireAuth, analyzeResume);
router.post("/analyze-pdf", requireAuth, upload.single("file"), analyzeResumePdf);

export default router;