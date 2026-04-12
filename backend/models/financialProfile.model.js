import mongoose from "mongoose";

const financialProfileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    monthly_income: {
      type: Number,
      required: true,
    },
    investment_capital: {
      type: Number,
      required: true,
    },
    risk_tolerance: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },
    investment_duration: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

const FinancialProfile = mongoose.model("FinancialProfile", financialProfileSchema);

export default FinancialProfile;
