import React from 'react';
import useAdvisorStore from '../store/advisorStore' ;
import InvestmentForm from '../components/InvestmentForm';
import ProfileSelector from '../components/ProfileSelector';
import SaveAdvisoryButton from '../components/SaveAdvisoryButton';
import useFinancialRiskDataStore from '../store/financialRiskDataStore'; 
import {  
  TrendingUp, 
  ShieldAlert, 
  PieChart, 
  ArrowRight, 
  Info,
  Calendar,
  Wallet,
  BadgeAlert
} from 'lucide-react' ;



/* ── Shared dark card shell ────────────────────────────────────── */
function DarkCard({ title, action, children }) {
  return (
    <div className="bg-[#0d1f3d] rounded-2xl p-5 flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[13.5px] font-bold text-white">{title}</span>
        {action}
      </div>
      {children}
    </div>
  );
}

function CheckRow({ bold, rest }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="shrink-0 mt-[1px]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3d9e5f" strokeWidth="2.8">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </span>
      <span className="text-[12.5px] text-white/65 leading-[1.45]">
        {bold && <strong className="text-white/90 font-semibold">{bold}</strong>}
        {rest}
      </span>
    </div>
  );
}

/* ── Portfolio Report Component ────────────────────────────────── */
function PortfolioReport({ values, calculated, regionalData, profileId }) {
  if (!calculated) return null;

  const { investment, duration, risk } = values;
  
  // Calculate recommended allocation based on risk tolerance
  const getAllocation = (riskLevel) => {
    switch (riskLevel) {
      case 'low':
        return { stocks: 10, mutualFunds: 20, bonds: 40, gold: 15, cash: 15 };
      case 'medium':
        return { stocks: 30, mutualFunds: 30, bonds: 20, gold: 10, cash: 10 };
      case 'high':
        return { stocks: 50, mutualFunds: 30, bonds: 5, gold: 10, cash: 5 };
      default:
        return { stocks: 30, mutualFunds: 30, bonds: 20, gold: 10, cash: 10 };
    }
  };

  const allocation = getAllocation(risk);
  
  // Calculate projected values
  const calculateProjection = (amount, rate, years) => {
    const r = parseFloat(rate) / 100;
    return amount * Math.pow(1 + r, years);
  };

  const totalProjected = Object.entries(allocation).reduce((acc, [asset, pct]) => {
    const assetAmount = (investment * pct) / 100;
    const rate = regionalData[asset].expectedReturn;
    return acc + calculateProjection(assetAmount, rate, duration);
  }, 0);

  const totalReturn = ((totalProjected - investment) / investment) * 100;

  return (
    <div className="anim-fade-up space-y-6 mt-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <PieChart className="w-5 h-5 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Portfolio Comprehensive Report</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Summary Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Growth Projection
            </h3>
          </div>
          <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Estimated Value after {duration} years</p>
                <h4 className="text-4xl font-extrabold text-slate-900">
                  ₹{Math.round(totalProjected).toLocaleString()}
                </h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    +{totalReturn.toFixed(1)}% Return
                  </span>
                  <span className="text-slate-400 text-xs font-medium">Over {duration} years</span>
                </div>
              </div>
              <div className="h-24 w-full md:w-64 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-center p-4">
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Risk Profile</p>
                  <p className={`text-sm font-bold uppercase ${
                    risk === 'high' ? 'text-red-500' : risk === 'medium' ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {risk} Growth Strategy
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(allocation).filter(([_, pct]) => pct > 0).map(([asset, pct]) => (
                <div key={asset} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                  <div className="text-2xl mb-1">{regionalData[asset].emoji}</div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">{regionalData[asset].label}</p>
                  <p className="text-lg font-bold text-slate-800">{pct}%</p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">Exp: {regionalData[asset].expectedReturn}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Assessment Card */}
        <div className="bg-[#0f172a] rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-slate-300 text-sm uppercase tracking-widest">Risk Analysis</h3>
              <ShieldAlert className="w-5 h-5 text-amber-500" />
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400">Portfolio Volatility</span>
                  <span className="text-white font-bold">Moderate</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-[60%] h-full bg-linear-to-r from-emerald-500 to-amber-500 rounded-full" />
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    "This allocation balances growth through {allocation.stocks}% equities while maintaining stability with {allocation.bonds}% in debt instruments."
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
             <SaveAdvisoryButton profileId={profileId} disabled={!calculated} />
             <button className="w-full py-3 bg-white text-slate-900 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
               Download PDF Report
               <ArrowRight className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
         <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-2.5 bg-rose-50 rounded-xl">
              <Calendar className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">Rebalancing Schedule</h4>
              <p className="text-xs text-slate-500">Review and rebalance every 6 months to maintain your {risk} risk target.</p>
            </div>
         </div>
         <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <Wallet className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">Tax Optimization</h4>
              <p className="text-xs text-slate-500">Utilize ELSS funds and tax-free bonds to enhance your net returns by 1-2%.</p>
            </div>
         </div>
         <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-2.5 bg-amber-50 rounded-xl">
              <BadgeAlert className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">Emergency Fund</h4>
              <p className="text-xs text-slate-500">Ensure at least 6 months of monthly income (₹{values.income * 6}) is kept in high-liquidity cash.</p>
            </div>
         </div>
      </div>
    </div>
  );
}

export default function AdvisorPage() {
  const { values, calculated, aiInsights, loadingInsights, setValues, handleCalculate } = useAdvisorStore();
  const { region, getRiskData } = useFinancialRiskDataStore();
  const [profileId, setProfileId] = React.useState(null);
  const regionalData = getRiskData(region);

  const handleChange = (field, val) => {
    setValues(field, val);
  };

  return (
    <>
      <main className="flex-1 px-10 pt-9 pb-16 max-w-[1280px]">

        {/* Page header */}
        <div className="anim-fade-up mb-7">
          <p className="text-[10.5px] font-bold text-[#2a6a3f] tracking-[0.14em] mb-2 uppercase">
            Investment Profile Input
          </p>
          <h1 className="text-[clamp(24px,3vw,36px)] font-extrabold text-[#0d1f3d] leading-tight tracking-tight">
            Define your financial Profile.
          </h1>
        </div>

        {/* Two-column layout */}
        <div className="anim-fade-up delay-1 grid gap-5 items-start" style={{ gridTemplateColumns: '1fr 268px' }}>
          <InvestmentForm values={values} onChange={handleChange} onCalculate={handleCalculate} />

          {/* Right stacked cards */}
          <div className="flex flex-col gap-3.5">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <ProfileSelector 
                onProfileSelect={setProfileId}
                disabled={!calculated}
              />
            </div>

            {(calculated || loadingInsights) && (
              <DarkCard
                title="AI Advisor Insights"
                action={
                  <span className="text-white/25 cursor-pointer">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </span>
                }
              >
                <div className="flex flex-col gap-2.5">
                  {loadingInsights ? (
                    <CheckRow rest="Analyzing your profile with AI..." />
                  ) : aiInsights.length > 0 ? (
                    aiInsights.map((insight, idx) => (
                      <CheckRow key={idx} rest={insight} />
                    ))
                  ) : (
                    <CheckRow rest="No insights available." />
                  )}
                </div>
              </DarkCard>
            )}
          </div>
        </div>

        <PortfolioReport values={values} calculated={calculated} regionalData={regionalData} profileId={profileId} />


      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-10 py-3.5 flex justify-between items-center flex-wrap gap-2">
        <span className="text-[11px] text-slate-400 font-medium tracking-[0.06em] uppercase">
          Global Wealth Management © 2025
        </span>
        <div className="flex gap-6">
          {['Privacy Policy', 'Risk Disclosure', 'Institutional Terms'].map(l => (
            <button
              key={l}
              className="bg-transparent border-none cursor-pointer text-[10.5px] text-slate-400 font-medium tracking-[0.06em] uppercase hover:text-[#0d1f3d] transition-colors"
            >
              {l}
            </button>
          ))}
        </div>
      </footer>
    </>
  );
}
