import express from "express";
import { signup, login, verifyToken } from "../controllers/authControllers.js";
import protect from "../middlewares/authMiddlware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/verify", protect, verifyToken);


export default router;
