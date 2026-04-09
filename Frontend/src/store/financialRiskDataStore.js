import { create } from 'zustand';

/* ── Default Asset Risk Data (Base) ──────────────────────────────– */
const DEFAULT_ASSET_RISKS = {
  stocks: {
    emoji: '📈',
    label: 'Stocks',
    riskLevel: 'HIGH',
    riskColor: 'red',
    volatility: '18.5%',
    volatilityDesc: 'Annual standard deviation',
    maxDrawdown: '-45 to -65%',
    drawdownDesc: 'Potential severe decline in bear markets',
    expectedReturn: '10-12%',
    returnDesc: 'Historical average annual return',
    riskScore: 8.5,
    predictedRisks: [
      { type: 'Market Volatility', severity: 'VERY HIGH', description: 'Stocks can swing 5-10% daily' },
      { type: 'Sector Risk', severity: 'HIGH', description: 'Different sectors perform differently' },
      { type: 'Company Risk', severity: 'HIGH', description: 'Individual company performance varies' },
      { type: 'Economic Risk', severity: 'HIGH', description: 'Recessions cause major declines' },
      { type: 'Geopolitical Risk', severity: 'MEDIUM', description: 'Political events impact markets' }
    ],
    scenarios: [
      { condition: 'Normal Market', probability: '60%', impact: '+8-12%' },
      { condition: 'Market Correction (10-20%)', probability: '25%', impact: '-10-20%' },
      { condition: 'Bear Market (>20% decline)', probability: '10%', impact: '-30-50%' },
      { condition: 'Crash (<-20% single day)', probability: '5%', impact: '-20-35%' }
    ],
    bestFor: 'Long-term growth, investors with 5+ year horizon',
    avoidIf: 'Need funds within 2 years, low risk tolerance'
  },
  mutualFunds: {
    emoji: '💼',
    label: 'Mutual Funds',
    riskLevel: 'MEDIUM-HIGH',
    riskColor: 'amber',
    volatility: '10.5%',
    volatilityDesc: 'Annual standard deviation',
    maxDrawdown: '-25 to -40%',
    drawdownDesc: 'Moderate decline during downturns',
    expectedReturn: '7-9%',
    returnDesc: 'Historical average annual return',
    riskScore: 6.2,
    predictedRisks: [
      { type: 'Manager Risk', severity: 'MEDIUM', description: 'Fund manager decisions affect returns' },
      { type: 'Expense Ratio Risk', severity: 'MEDIUM', description: 'Fees reduce net returns' },
      { type: 'Market Risk', severity: 'HIGH', description: 'Underlying holdings affected by markets' },
      { type: 'Liquidity Risk', severity: 'LOW', description: 'Usually liquid but some restrictions' },
      { type: 'Style Drift Risk', severity: 'MEDIUM', description: 'Fund strategy may change over time' }
    ],
    scenarios: [
      { condition: 'Normal Market', probability: '65%', impact: '+6-9%' },
      { condition: 'Market Correction (10-20%)', probability: '20%', impact: '-5-15%' },
      { condition: 'Bear Market (>20% decline)', probability: '12%', impact: '-20-35%' },
      { condition: 'Sector Down', probability: '3%', impact: '-10-25%' }
    ],
    bestFor: 'Passive investors, diversified exposure',
    avoidIf: 'Prefer direct stock control, cost-sensitive'
  },
  gold: {
    emoji: '🏆',
    label: 'Gold',
    riskLevel: 'MEDIUM',
    riskColor: 'amber',
    volatility: '12.8%',
    volatilityDesc: 'Annual standard deviation',
    maxDrawdown: '-15 to -30%',
    drawdownDesc: 'Limited decline, good safe haven',
    expectedReturn: '4-6%',
    returnDesc: 'Historical average annual return',
    riskScore: 5.8,
    predictedRisks: [
      { type: 'Currency Risk', severity: 'MEDIUM', description: 'Value tied to USD strength' },
      { type: 'Interest Rate Risk', severity: 'MEDIUM', description: 'Rising rates pressure gold prices' },
      { type: 'Inflation Risk', severity: 'LOW', description: 'Actually benefits from inflation' },
      { type: 'Supply Risk', severity: 'LOW', description: 'Stable supply from mining' },
      { type: 'Demand Risk', severity: 'MEDIUM', description: 'Jewelry/industrial demand fluctuates' }
    ],
    scenarios: [
      { condition: 'Market Panic', probability: '15%', impact: '+5-15%' },
      { condition: 'Normal Market', probability: '50%', impact: '+2-6%' },
      { condition: 'Rising Rates', probability: '25%', impact: '-5-10%' },
      { condition: 'Inflation Spike', probability: '10%', impact: '+10-20%' }
    ],
    bestFor: 'Portfolio insurance, inflation hedge',
    avoidIf: 'Seeking high returns, limited inflation outlook'
  },
  bonds: {
    emoji: '📊',
    label: 'Bonds',
    riskLevel: 'LOW',
    riskColor: 'emerald',
    volatility: '5.2%',
    volatilityDesc: 'Annual standard deviation',
    maxDrawdown: '-5 to -15%',
    drawdownDesc: 'Minimal losses, stable income',
    expectedReturn: '3-5%',
    returnDesc: 'Historical average annual return',
    riskScore: 2.8,
    predictedRisks: [
      { type: 'Interest Rate Risk', severity: 'MEDIUM', description: 'Bond prices fall when rates rise' },
      { type: 'Credit Risk', severity: 'LOW-MEDIUM', description: 'Issuer default possibility' },
      { type: 'Inflation Risk', severity: 'MEDIUM', description: 'Inflation erodes real returns' },
      { type: 'Duration Risk', severity: 'MEDIUM', description: 'Long-term bonds more volatile' },
      { type: 'Reinvestment Risk', severity: 'LOW', description: 'Lower rates on reinvestment' }
    ],
    scenarios: [
      { condition: 'Falling Rates', probability: '15%', impact: '+3-8%' },
      { condition: 'Stable Rates', probability: '60%', impact: '+2-4%' },
      { condition: 'Rising Rates', probability: '20%', impact: '-2-5%' },
      { condition: 'Credit Crisis', probability: '5%', impact: '-5-10%' }
    ],
    bestFor: 'Conservative investors, income generation',
    avoidIf: 'In zero-rate environment, inflation outlook high'
  },
  cash: {
    emoji: '💵',
    label: 'Cash',
    riskLevel: 'VERY LOW',
    riskColor: 'emerald',
    volatility: '0.5%',
    volatilityDesc: 'Virtually no fluctuation',
    maxDrawdown: '0%',
    drawdownDesc: 'Principal completely protected',
    expectedReturn: '4-5%',
    returnDesc: 'Current interest rates (variable)',
    riskScore: 0.5,
    predictedRisks: [
      { type: 'Inflation Risk', severity: 'VERY HIGH', description: 'Inflation erodes purchasing power' },
      { type: 'Interest Rate Risk', severity: 'LOW', description: 'Rates may decrease' },
      { type: 'Opportunity Risk', severity: 'VERY HIGH', description: 'Missing out on growth' },
      { type: 'Bank Risk', severity: 'VERY LOW', description: 'FDIC insured up to $250K' },
      { type: 'Liquidity Risk', severity: 'NONE', description: 'Always accessible' }
    ],
    scenarios: [
      { condition: 'Rising Rates', probability: '30%', impact: '+4-5%' },
      { condition: 'Stable Rates', probability: '40%', impact: '+3-4%' },
      { condition: 'Falling Rates', probability: '25%', impact: '+1-2%' },
      { condition: 'Bank Crisis', probability: '5%', impact: 'Protected (FDIC)' }
    ],
    bestFor: 'Emergency funds, short-term needs',
    avoidIf: 'Long-term investing, inflation environment'
  }
};


const REGIONAL_ASSET_RISKS = {
  india: {
    stocks: {
      ...DEFAULT_ASSET_RISKS.stocks,
      label: 'Stocks (India)',
      expectedReturn: '15.28%',
      returnDesc: 'Nifty 50 TR 5-year CAGR (as of Mar 31, 2024)',
      volatility: '19.07%',
      volatilityDesc: 'Nifty 50 TR annualized volatility (5-year)',
      bestFor: 'Long-term growth, 5+ year horizon',
      avoidIf: 'Need funds within 2 years, low risk tolerance'
    },
    mutualFunds: {
      ...DEFAULT_ASSET_RISKS.mutualFunds,
      label: 'Mutual Funds (India)',
      expectedReturn: '18.21%',
      returnDesc: 'HSBC Nifty 50 Index Fund direct plan 5-year compounded annualized return',
      bestFor: 'Passive investors, diversified Indian large-cap exposure',
      avoidIf: 'Prefer direct stock control, cost-sensitive'
    },
    bonds: {
      ...DEFAULT_ASSET_RISKS.bonds,
      label: 'Bonds (India)',
      expectedReturn: '6.14%',
      returnDesc: 'Nifty 5 yr Benchmark G-Sec Index 5-year return',
      bestFor: 'Conservative investors, income generation',
      avoidIf: 'Inflation outlook high'
    },
    gold: {
      ...DEFAULT_ASSET_RISKS.gold,
      label: 'Gold (India)',
      expectedReturn: '22.18%',
      returnDesc: 'Approx 5-year CAGR from INR 50,151/10g (2020) to INR 1,36,570/10g (2025)',
      bestFor: 'Portfolio hedge, inflation protection',
      avoidIf: 'Seeking high growth only'
    },
    cash: {
      ...DEFAULT_ASSET_RISKS.cash,
      label: 'Cash (India)',
      expectedReturn: '5.38%',
      returnDesc: '3-month T-bill / cash-like yield proxy',
      bestFor: 'Emergency funds, short-term needs',
      avoidIf: 'Long-term investing, inflation-heavy environment'
    }
  },

  us: {
    stocks: {
      ...DEFAULT_ASSET_RISKS.stocks,
      label: 'Stocks (US)',
      expectedReturn: '14.42%',
      returnDesc: 'S&P 500 index 5-year average annual return (as of Dec 31, 2025)',
      bestFor: 'Long-term growth, 5+ year horizon',
      avoidIf: 'Need funds within 2 years, low risk tolerance'
    },
    mutualFunds: {
      ...DEFAULT_ASSET_RISKS.mutualFunds,
      label: 'Mutual Funds (US)',
      expectedReturn: '14.40%',
      returnDesc: 'Schwab S&P 500 Index Fund 5-year average annual return',
      bestFor: 'Passive investors, diversified US large-cap exposure',
      avoidIf: 'Prefer direct stock control, cost-sensitive'
    },
    bonds: {
      ...DEFAULT_ASSET_RISKS.bonds,
      label: 'Bonds (US)',
      expectedReturn: '5.72%',
      returnDesc: 'S&P U.S. Aggregate Bond Index 5-year return',
      bestFor: 'Conservative investors, income generation',
      avoidIf: 'Inflation outlook high'
    },
    gold: {
      ...DEFAULT_ASSET_RISKS.gold,
      label: 'Gold (US)',
      expectedReturn: '12.69%',
      returnDesc: 'Approx 5-year CAGR from US$1,887.6/oz (2020) to US$3,431/oz (2025)',
      bestFor: 'Portfolio hedge, inflation protection',
      avoidIf: 'Seeking high growth only'
    },
    cash: {
      ...DEFAULT_ASSET_RISKS.cash,
      label: 'Cash (US)',
      expectedReturn: '3.62%',
      returnDesc: '3-month Treasury bill yield proxy',
      bestFor: 'Emergency funds, short-term needs',
      avoidIf: 'Long-term investing, inflation-heavy environment'
    }
  }
};

const useFinancialRiskDataStore = create((set) => ({
  region: 'india',
  setRegion: (region) => set({ region }),
  getRiskData: (region) => REGIONAL_ASSET_RISKS[region] || REGIONAL_ASSET_RISKS.india,
  allRegionalRisks: REGIONAL_ASSET_RISKS
}));

export default useFinancialRiskDataStore;