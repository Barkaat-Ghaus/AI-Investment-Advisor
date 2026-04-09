import { create } from 'zustand';

const API_URL = 'http://localhost:3001/api/finance';

const useRiskStore = create((set, get) => ({
  risks: {
    stocks: null,
    mutualFunds: null,
    gold: null,
    bonds: null,
    cash: null,
  },
  isLoading: false,
  error: null,

  fetchRiskMetrics: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/risk-metrics`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch risk metrics');
      }

      const data = await response.json();
      set({ 
        risks: data,
        isLoading: false 
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error('Risk metrics fetch error:', error);
    }
  },

  fetchAssetRisk: async (assetType) => {
    try {
      const response = await fetch(`${API_URL}/risk-metrics/${assetType}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch risk metrics for ${assetType}`);
      }

      const data = await response.json();
      set((state) => ({
        risks: {
          ...state.risks,
          [assetType]: data
        }
      }));
      return data;
    } catch (error) {
      console.error(`Asset risk fetch error for ${assetType}:`, error);
      throw error;
    }
  }
}));

export default useRiskStore;
