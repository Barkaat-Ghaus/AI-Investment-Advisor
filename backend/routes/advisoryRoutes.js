import express from "express";
import {
  createAdvisory,
  getUserAdvisories,
  getAdvisoryById,
  updateAdvisory,
  deleteAdvisory,
  getAdvisoriesByProfile,
} from "../controllers/advisoryController.js";
import protect from "../middlewares/authMiddlware.js";

const router = express.Router();

// Create new advisory (auth required)
router.post("/", protect, createAdvisory);

// Get all advisories for a user
router.get("/user/:user_id", protect, getUserAdvisories);

// Get advisories by profile
router.get("/profile/:profile_id", protect, getAdvisoriesByProfile);

// Get advisory by ID
router.get("/:advisory_id", protect, getAdvisoryById);

// Update advisory
router.put("/:advisory_id", protect, updateAdvisory);

// Delete advisory
router.delete("/:advisory_id", protect, deleteAdvisory);

export default router;
