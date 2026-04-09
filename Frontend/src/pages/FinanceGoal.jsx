import React, { useState, useEffect } from 'react';
import { 
  Target, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Info,
  RefreshCw,
  Wallet,
  Zap,
  Globe
} from 'lucide-react';
import useFinancialRiskDataStore from '../store/financialRiskDataStore';
import useFinanceStore from '../store/financeStore';


/* ── Asset Card for Comparison ────────────────────────────────── */
function AssetComparisonCard({ asset, timeToGoal, regionalData, targetMet }) {
  const data = regionalData[asset];
  
  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 ${
      targetMet ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-75'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{data.emoji}</span>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">{data.label}</h4>
            <p className="text-[10px] text-emerald-600 font-bold">Exp: {data.expectedReturn}</p>
          </div>
        </div>
        {targetMet && (
          <div className="p-2 bg-emerald-50 rounded-full">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase">Time to Achieve</p>
          <p className="text-xl font-extrabold text-slate-900">
            {timeToGoal < 100 ? `${timeToGoal.toFixed(1)} Years` : '100+ Years'}
          </p>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 rounded-full" 
            style={{ width: `${Math.max(5, 100 - (timeToGoal * 2))}%` }} 
          />
        </div>
      </div>
    </div>
  );
}

export default function FinanceGoal() {
  const { region, setRegion, getRiskData } = useFinancialRiskDataStore();
  const regionalData = getRiskData(region);
  
  const [step, setStep] = useState(0); // 0=Greeting, 1-10=Questions, 11=Result
  const [answers, setAnswers] = useState({
    goalName: 'Retirement',
    targetAmount: 4500,
    initialCapital: 1000,
    monthlySave: 500,
    desiredYears: 5,
    riskProfile: 'moderate',
    investmentRegion: 'india',
    priority: 'growth',
    currentIncome: 4500,
    inflationAdjust: 'yes'
  });
  
  const { 
    projections, 
    aiResponse, 
    isLoading, 
    generateAnalysis,
    resetAnalysis 
  } = useFinanceStore();

  const questions = [
    { key: 'goalName', label: '1. What are we planning for?', type: 'select', options: ['Retirement', 'Build House', 'Buy Car', 'Child Education', 'Marriage', 'Other'], icon: <Target className="w-5 h-5" /> },
    { key: 'targetAmount', label: '2. Your target corpus (₹)?', type: 'number', placeholder: 'Target savings amount', icon: <Wallet className="w-5 h-5" /> },
    { key: 'initialCapital', label: '3. Starting capital (₹)?', type: 'number', placeholder: 'How much you have saved now', icon: <TrendingUp className="w-5 h-5" /> },
    { key: 'monthlySave', label: '4. Monthly contribution (₹)?', type: 'number', placeholder: 'Amount you can invest monthly', icon: <RefreshCw className="w-5 h-5" /> },
    { key: 'desiredYears', label: '5. Desired timeline (Years)?', type: 'number', placeholder: 'When do you want to achieve this?', icon: <Clock className="w-5 h-5" /> },
    { key: 'riskProfile', label: '6. Your risk appetite?', type: 'select', options: ['conservative', 'moderate', 'aggressive'], icon: <Zap className="w-5 h-5" /> },
    { key: 'investmentRegion', label: '7. Preferred market?', type: 'select', options: ['india', 'us'], icon: <Globe className="w-5 h-5" /> },
    { key: 'priority', label: '8. Primary focus?', type: 'select', options: ['growth', 'capital preservation', 'balanced'], icon: <TrendingUp className="w-5 h-5" /> },
    { key: 'currentIncome', label: '9. Current monthly income (₹)?', type: 'number', icon: <Wallet className="w-5 h-5" /> },
    { key: 'inflationAdjust', label: '10. Adjust for inflation (6%)?', type: 'select', options: ['yes', 'no'], icon: <Sparkles className="w-5 h-5" /> }
  ];

  const handleNext = () => {
    if (step < 10) setStep(s => s + 1);
    else {
      setStep(11);
      // Ensure correct region in risk store
      setRegion(answers.investmentRegion);
      // Get data and analyze
      generateAnalysis(answers, getRiskData(answers.investmentRegion));
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };


  const currentQuestion = questions[step - 1];

  return (
    <main className="min-h-[calc(100vh-80px)] p-6 md:p-10 flex flex-col items-center justify-center bg-linear-to-b from-slate-50 to-white">
      
      {/* ── Greeting ────────────────────────────────────────────── */}
      {step === 0 && (
        <div className=" text-center space-y-8 max-w-2xl">
          <div className="inline-flex p-4 bg-indigo-100 rounded-3xl mb-4 group hover:scale-110 transition-transform cursor-pointer">
            <Sparkles className="w-10 h-10 text-indigo-600 animate-pulse" />
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
            Hello! Let's map your <span className="text-indigo-600">financial destiny.</span>
          </h1>
          <p className="text-slate-500 text-xl leading-relaxed">
            Answer 10 simple questions and we'll calculate exactly how, where, and when you can achieve your financial dreams.
          </p>
          <button 
            onClick={handleNext}
            className=" flex text-center items-center gap-3 bg-[#0d1f3d] text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-200"
          >
            Start Goal Assessment
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* ── Question Card ───────────────────────────────────────── */}
      {step >= 1 && step <= 10 && (
        <div className="anim-fade-up w-full max-w-xl">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl p-10 relative overflow-hidden">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 h-1.5 bg-slate-100 w-full">
              <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${step * 10}%` }} />
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                {currentQuestion.icon}
              </div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Question {step} of 10</span>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-8 leading-tight">
              {currentQuestion.label}
            </h2>

            {currentQuestion.type === 'select' ? (
              <div className="grid gap-3">
                {currentQuestion.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setAnswers({ ...answers, [currentQuestion.key]: opt })}
                    className={`p-5 rounded-2xl border-2 text-left font-bold capitalize transition-all ${
                      answers[currentQuestion.key] === opt 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' 
                      : 'border-slate-100 hover:border-slate-200 text-slate-500'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type={currentQuestion.type}
                autoFocus
                value={answers[currentQuestion.key]}
                onChange={(e) => setAnswers({ ...answers, [currentQuestion.key]: e.target.value })}
                placeholder={currentQuestion.placeholder}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 text-xl font-bold text-slate-800 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
              />
            )}

            <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-100">
              <button 
                onClick={handleBack}
                className={`flex items-center gap-2 font-bold transition-colors ${
                  step === 1 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-slate-600'
                }`}
                disabled={step === 1}
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              <button 
                onClick={handleNext}
                disabled={!answers[currentQuestion.key] && currentQuestion.type === 'text'}
                className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-200 disabled:opacity-50 active:scale-95"
              >
                {step === 10 ? 'Generate Strategy' : 'Continue'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Result Analysis ─────────────────────────────────────── */}
      {step === 11 && (
        <div className="anim-fade-up w-full max-w-6xl space-y-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2">
                Note: Below calculations are based on previous 5 years of market data
              </p>
              <h1 className="text-4xl font-extrabold text-slate-900">
                Your <span className="text-indigo-600 capitalize">{answers.goalName}</span> Report
              </h1>
              <p className="text-slate-500 text-lg">Based on regional market data for {answers.investmentRegion.toUpperCase()}</p>
            </div>
            <button 
              onClick={() => {
                setStep(0);
                resetAnalysis();
              }} 
              className="flex items-center gap-2 text-indigo-600 font-bold hover:bg-indigo-50 px-5 py-2.5 rounded-xl transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Recalculate Goal
            </button>
          </div>

          {/* Asset Timeline grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {projections.map(proj => (
              <AssetComparisonCard 
                key={proj.key} 
                asset={proj.key} 
                timeToGoal={proj.time} 
                regionalData={regionalData}
                targetMet={proj.targetMet}
              />
            ))}
          </div>

          {/* AI Strategic Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-[#0d1f3d] rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden group border border-white/5">
              <div className="absolute -top-24 -right-24 p-10 opacity-5 group-hover:scale-110 transition-transform duration-1000 rotate-12">
                <Target className="w-96 h-96" />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/20 rounded-full text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-indigo-500/30">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  Portfolio Intelligence
                </div>
                
                <h3 className="text-4xl font-extrabold mb-10 leading-tight">
                  Strategic Roadmap for your <span className="text-indigo-400">{answers.goalName}</span>
                </h3>

                <div className="space-y-8">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1,2,3].map(i => <div key={i} className="h-4 bg-white/5 rounded-full animate-pulse" style={{ width: `${100-i*10}%` }} />)}
                    </div>
                  ) : (
                    aiResponse.split('|').map((point, idx) => (
                      <div key={idx} className="flex gap-6 items-start group/tip">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover/tip:bg-indigo-500/20 group-hover/tip:border-indigo-500/40 transition-all">
                          <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                        </div>
                        <p className="text-slate-300 text-base leading-relaxed font-medium pt-1">{point.trim()}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Target vs Reality Summary */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 flex flex-col justify-between shadow-xl">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest">Target Check</h4>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <Info className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-slate-500">Desired Timeline</span>
                    <span className="text-xl font-black text-slate-900">{answers.desiredYears} Yrs</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-slate-500">Real Market Avg</span>
                    <span className="text-xl font-black text-indigo-600">
                      {~~(projections.reduce((a, b) => a + b.time, 0) / 5)} Yrs
                    </span>
                  </div>
                </div>

                <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
                  <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                    Based on your aggressive risk profile, you can reach this goal 25% faster by weightage in Equity and Mutual Funds.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <button className="w-full py-5 bg-slate-100 text-slate-800 rounded-2xl font-bold text-sm tracking-tight hover:bg-slate-200 transition-colors uppercase">
                  Adjust Plan Variables
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
