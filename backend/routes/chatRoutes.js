import express from "express";
import { chatWithAI } from "../controllers/chatController.js";
import protect from "../middlewares/authMiddlware.js";

const router = express.Router();

// POST /api/chat (auth required)
router.post("/", protect, chatWithAI);

export default router;
