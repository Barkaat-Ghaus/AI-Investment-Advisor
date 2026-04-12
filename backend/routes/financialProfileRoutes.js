import express from "express";
import { createOrUpdateFinancialProfile, getFinancialProfile } from "../controllers/financialProfileController.js";
import protect from "../middlewares/authMiddlware.js";

const router = express.Router();

router.post("/", protect, createOrUpdateFinancialProfile);
router.get("/", protect, getFinancialProfile);

export default router;
 