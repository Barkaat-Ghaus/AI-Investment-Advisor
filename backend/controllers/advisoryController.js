import Advisory from "../models/advisory.model.js";
import FinancialProfile from "../models/financialProfile.model.js";

// Create new advisory
export const createAdvisory = async (req, res) => {
  try {
    const { user_id, profile_id, equity_allocation, bond_allocation, gold_allocation, mutual_fund_allocation, cash_allocation, advisory_text, current_price, market_source } = req.body;

    // Verify profile exists and belongs to user
    const profile = await FinancialProfile.findById(profile_id);
    if (!profile) {
      return res.status(404).json({ message: "Financial profile not found" });
    }
    if (profile.user_id.toString() !== user_id) {
      return res.status(403).json({ message: "Unauthorized: Profile does not belong to user" });
    }

    const advisory = await Advisory.create({
      user_id,
      profile_id,
      equity_allocation,
      bond_allocation,
      gold_allocation,
      mutual_fund_allocation,
      cash_allocation,
      advisory_text,
      current_price,
      market_source,
    });

    res.status(201).json({ message: "Advisory created successfully", advisory });
  } catch (error) {
    res.status(500).json({ message: "Failed to create advisory", error: error.message });
  }
};

// Get all advisories for a user
export const getUserAdvisories = async (req, res) => {
  try {
    const { user_id } = req.params;

    const advisories = await Advisory.find({ user_id })
      .populate("user_id", "name email")
      .populate("profile_id");

    res.status(200).json({ advisories });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch advisories", error: error.message });
  }
};

// Get advisory by ID
export const getAdvisoryById = async (req, res) => {
  try {
    const { advisory_id } = req.params;

    const advisory = await Advisory.findById(advisory_id)
      .populate("user_id", "name email")
      .populate("profile_id");

    if (!advisory) {
      return res.status(404).json({ message: "Advisory not found" });
    }

    res.status(200).json({ advisory });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch advisory", error: error.message });
  }
};

// Update advisory
export const updateAdvisory = async (req, res) => {
  try {
    const { advisory_id } = req.params;
    const updates = req.body;

    const advisory = await Advisory.findByIdAndUpdate(advisory_id, updates, { new: true });

    if (!advisory) {
      return res.status(404).json({ message: "Advisory not found" });
    }

    res.status(200).json({ message: "Advisory updated successfully", advisory });
  } catch (error) {
    res.status(500).json({ message: "Failed to update advisory", error: error.message });
  }
};

// Delete advisory
export const deleteAdvisory = async (req, res) => {
  try {
    const { advisory_id } = req.params;

    const advisory = await Advisory.findByIdAndDelete(advisory_id);

    if (!advisory) {
      return res.status(404).json({ message: "Advisory not found" });
    }

    res.status(200).json({ message: "Advisory deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete advisory", error: error.message });
  }
};

// Get advisories by profile ID
export const getAdvisoriesByProfile = async (req, res) => {
  try {
    const { profile_id } = req.params;

    const advisories = await Advisory.find({ profile_id })
      .populate("user_id", "name email")
      .populate("profile_id");

    res.status(200).json({ advisories });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch advisories", error: error.message });
  }
};
