import mongoose from "mongoose";

const advisorySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    profile_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinancialProfile",
      required: true,
    },
    equity_allocation: {
      type: Number,
      required: true,
    },
    bond_allocation: {
      type: Number,
      required: true,
    },
    gold_allocation: {
      type: Number,
      required: true,
    },
    mutual_fund_allocation: {
      type: Number,
      required: true,
    },
    cash_allocation: {
      type: Number,
      required: true,
    },
    advisory_text: {
      type: String,
      required: true,
    },
    current_price: {
      type: Number,
    },
    market_source: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Advisory = mongoose.model("Advisory", advisorySchema);

export default Advisory;
