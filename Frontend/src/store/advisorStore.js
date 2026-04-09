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
  }
}));

export default useAdvisorStore;
