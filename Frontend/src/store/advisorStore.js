import { create } from "zustand";
import API_BASE_URL from '../config/api'; 

const DEFAULT_VALUES = {
  income:     60000,
  investment: 20000,
  duration:   10,
  risk:       'medium',
  goal:       'wealth_growth',
};

const useAdvisorStore = create((set, get) => ({
  values: DEFAULT_VALUES,
  calculated: false,
  aiInsights: [],
  loadingInsights: false,
  savingAdvisory: false,
  saveError: null,
  saveSuccess: null,

  setValues: (field, val) => set((state) => ({
    values: { ...state.values, [field]: val },
    calculated: false
  })),

  handleCalculate: async () => {
    set({ calculated: true, loadingInsights: true });
    try {
      const { values } = get();
      const message = `Generate exactly 5  bullet points consist of minimum 20 words and maximum 60 words (separated by '|') of direct investment advice for an investor with ₹${values.income} monthly income, investing ₹${values.investment}, duration ${values.duration} years, ${values.risk} risk tolerance. Do not include introductory text, markdown, or numbers. Just the 5 points separated by '|'.`;
      
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      
      const data = await res.json();
      
      if (data.answer) {
        if (!data.success) {
          set({ aiInsights: [data.answer] });
        } else {
          const pts = data.answer.replace(/\n|•|-|\*/g, '').split('|').map(p => p.trim()).filter(p => p);
          set({ aiInsights: pts.length > 0 ? pts : [data.answer] });
        }
      } else {
        set({ aiInsights: ["No insights returned."] });
      }
    } catch {
      set({ aiInsights: ["Error fetching real-time AI insights.", "Please check your network connection."] });
    } finally {
      set({ loadingInsights: false });
    }
  },

  saveAdvisory: async (userId, profileId, allocationData) => {
    set({ savingAdvisory: true, saveError: null, saveSuccess: null });
    try {
      const { values, aiInsights } = get();
      
      // Get allocation percentages based on risk
      const getAllocation = (riskLevel) => {
        switch (riskLevel) {
          case 'low':
            return { stocks: 10, bonds: 40, gold: 15, mutualFunds: 20, cash: 15 };
          case 'medium':
            return { stocks: 30, bonds: 20, gold: 10, mutualFunds: 30, cash: 10 };
          case 'high':
            return { stocks: 50, bonds: 5, gold: 10, mutualFunds: 30, cash: 5 };
          default:
            return { stocks: 30, bonds: 20, gold: 10, mutualFunds: 30, cash: 10 };
        }
      };

      const allocation = getAllocation(values.risk);

      const advisoryData = {
        user_id: userId,
        profile_id: profileId,
        equity_allocation: allocation.stocks,
        bond_allocation: allocation.bonds,
        gold_allocation: allocation.gold,
        mutual_fund_allocation: allocation.mutualFunds,
        cash_allocation: allocation.cash,
        advisory_text: aiInsights.join(' | ') || 'Investment advisory based on profile analysis',
        current_price: values.investment,
        market_source: 'AI Investment Advisor',
      };

      const res = await fetch(`${API_BASE_URL}/api/advisory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(advisoryData),
      });

      const data = await res.json();

      if (res.ok) {
        set({ 
          saveSuccess: 'Advisory saved successfully!',
          savingAdvisory: false 
        });
        return { success: true, message: 'Advisory saved successfully', advisory: data.advisory };
      } else {
        set({ 
          saveError: data.message || 'Failed to save advisory',
          savingAdvisory: false 
        });
        return { success: false, message: data.message };
      }
    } catch (error) {
      set({ 
        saveError: error.message,
        savingAdvisory: false 
      });
      return { success: false, message: error.message };
    }
  },

  clearSaveMessages: () => set({ saveError: null, saveSuccess: null })
}));

export default useAdvisorStore;
