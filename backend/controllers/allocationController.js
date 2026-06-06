import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

// Zod schema to strictly validate AI-returned allocation
const AllocationSchema = z.object({
  stocks:      z.number().min(0).max(100),
  mutualFunds: z.number().min(0).max(100),
  bonds:       z.number().min(0).max(100),
  gold:        z.number().min(0).max(100),
  cash:        z.number().min(0).max(100),
}).refine(
  (data) => {
    const total = data.stocks + data.mutualFunds + data.bonds + data.gold + data.cash;
    return Math.abs(total - 100) <= 2; // allow ±2 rounding tolerance
  },
  { message: "Allocation percentages must sum to 100" }
);

export const getAIAllocation = async (req, res) => {
  const { income, investment, duration, risk, goal } = req.body;

  if (!income || !investment || !duration || !risk) {
    return res.status(400).json({ message: "Missing required fields: income, investment, duration, risk" });
  }

  const prompt = `You are a financial advisor AI. Based on the investor profile below, generate an optimal portfolio allocation.

Investor Profile:
- Monthly Income: ₹${income}
- Investment Amount: ₹${investment}
- Investment Duration: ${duration} years
- Risk Tolerance: ${risk} (low / medium / high)
- Goal: ${goal || "wealth_growth"}

IMPORTANT: Respond ONLY with a valid JSON object. No markdown, no explanation, no extra text.
The JSON must have exactly these 5 keys with integer or decimal values that sum to exactly 100:
{
  "stocks": <number>,
  "mutualFunds": <number>,
  "bonds": <number>,
  "gold": <number>,
  "cash": <number>
}`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "AI Investment Advisor",
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenRouter request failed: ${text}`);
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content || "";

    // Extract JSON from the response (strip any markdown code fences if present)
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI did not return a valid JSON object");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and parse with Zod
    const result = AllocationSchema.safeParse(parsed);

    if (!result.success) {
      console.error("[Allocation] Zod validation failed:", result.error.flatten());
      // Fall back to sensible defaults based on risk level
      const fallback = getFallbackAllocation(risk);
      return res.status(200).json({ allocation: fallback, source: "fallback", reason: result.error.message });
    }

    return res.status(200).json({ allocation: result.data, source: "ai" });
  } catch (error) {
    console.error("[Allocation] Error:", error.message);
    // Graceful fallback so the frontend never breaks
    const fallback = getFallbackAllocation(risk);
    return res.status(200).json({ allocation: fallback, source: "fallback", reason: error.message });
  }
};

function getFallbackAllocation(risk) {
  switch (risk) {
    case "low":    return { stocks: 10, mutualFunds: 20, bonds: 40, gold: 15, cash: 15 };
    case "high":   return { stocks: 50, mutualFunds: 30, bonds: 5,  gold: 10, cash: 5  };
    default:       return { stocks: 30, mutualFunds: 30, bonds: 20, gold: 10, cash: 10 };
  }
}
