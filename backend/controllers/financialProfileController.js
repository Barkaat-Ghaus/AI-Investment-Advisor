import FinancialProfile from "../models/financialProfile.model.js";

export const createOrUpdateFinancialProfile = async (req, res) => {
  try {
    const { monthly_income, investment_capital, risk_tolerance, investment_duration } = req.body;
    const user_id = req.user.id; // From authMiddleware

    // Basic validation
    if (!monthly_income || !investment_capital || !risk_tolerance || !investment_duration) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if profile already exists for the user
    let profile = await FinancialProfile.findOne({ user_id });

    if (profile) {
      // Update existing profile
      profile.monthly_income = monthly_income;
      profile.investment_capital = investment_capital;
      profile.risk_tolerance = risk_tolerance;
      profile.investment_duration = investment_duration;
      await profile.save();
      return res.status(200).json({ message: "Financial profile updated successfully", profile });
    }

    // Create new profile
    profile = await FinancialProfile.create({
      user_id,
      monthly_income,
      investment_capital,
      risk_tolerance,
      investment_duration,
    });

    res.status(201).json({ message: "Financial profile created successfully", profile });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getFinancialProfile = async (req, res) => {
  try {
    const user_id = req.user.id;
    const profile = await FinancialProfile.findOne({ user_id });

    if (!profile) {
      return res.status(404).json({ message: "Financial profile not found" });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
