import { create } from 'zustand';
import API_BASE_URL from '../config/api';

const calculateTimeToGoal = (pv, p, fv, annualRate) => {
  const r = (parseFloat(annualRate) / 100) / 12;
  if (r <= 0) return (fv - pv) / (p * 12);
  
  try {
    // n = ln((FV + P/r) / (PV + P/r)) / ln(1+r)
    const months = Math.log((fv + p / r) / (pv + p / r)) / Math.log(1 + r);
    return Math.max(0, months / 12);
  } catch (e) {
    return 100; // Cap at 100 years
  }
};

const useFinanceStore = create((set, get) => ({
  projections: [],
  aiResponse: '',
  isLoading: false,
  topStocksUs: [],
  topStocksIndia: [],

  fetchTopStocks: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE_URL}/api/finance/top-performers`);
      const data = await res.json();
      set({ 
        topStocksUs: data.us || [], 
        topStocksIndia: data.india || [],
        isLoading: false 
      });
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Fetch stocks error:", err);
      }
      set({ isLoading: false });
    }
  },

  generateAnalysis: async (answers, regionalData) => {
    set({ isLoading: true, aiResponse: '' });
    
    // 1. Calculate projections for each asset
    const results = Object.keys(regionalData).map(assetKey => {
      const time = calculateTimeToGoal(
        answers.initialCapital, 
        answers.monthlySave, 
        answers.targetAmount, 
        regionalData[assetKey].expectedReturn
      );
      return {
        key: assetKey,
        time,
        targetMet: time <= answers.desiredYears
      };
    });
    
    set({ projections: results });

    // 2. Call AI API for custom response
    try {
      const prompt = `Act as an elite financial advisor. A user wants to achieve the goal "${answers.goalName}" with a target of ₹${answers.targetAmount}. They have ₹${answers.initialCapital} saved and can contribute ₹${answers.monthlySave} monthly. Their desired time is ${answers.desiredYears} years. Their risk profile is ${answers.riskProfile} and investing in ${answers.investmentRegion}. Generate 5 strategic bullet points (separated by '|') for achieving this goal. Keep it minimum 30 words and under 100 words total. No intro.`;
      
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt })
      });
      
      const data = await res.json();
      set({ 
        aiResponse: data.answer || "Maintain disciplined investing and prioritize high-growth assets to meet your timeline.",
      });
    } catch (err) {
      set({ aiResponse: "Discipline and asset allocation are key to your goal." });
    } finally {
      set({ isLoading: false });
    }
  },
  
  resetAnalysis: () => set({ 
    projections: [], 
    aiResponse: '', 
    isLoading: false 
  })
}));

export default useFinanceStore;
