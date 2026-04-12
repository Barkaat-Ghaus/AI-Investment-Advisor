import express from "express";
import {
  createAdvisory,
  getUserAdvisories,
  getAdvisoryById,
  updateAdvisory,
  deleteAdvisory,
  getAdvisoriesByProfile,
} from "../controllers/advisoryController.js";

const router = express.Router();

// Create new advisory
router.post("/", createAdvisory);

// Get all advisories for a user
router.get("/user/:user_id", getUserAdvisories);

// Get advisories by profile
router.get("/profile/:profile_id", getAdvisoriesByProfile);

// Get advisory by ID
router.get("/:advisory_id", getAdvisoryById);

// Update advisory
router.put("/:advisory_id", updateAdvisory);

// Delete advisory
router.delete("/:advisory_id", deleteAdvisory);

export default router;
