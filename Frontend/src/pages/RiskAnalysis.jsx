import React, { useState, useEffect } from 'react';
import {
  TrendingDown,
  AlertCircle,
  TrendingUp,
  Gauge,
  BarChart3,
  Info,
  Shield,
  Loader
} from 'lucide-react';
import useRiskStore from '../store/riskStore';
import useFinancialRiskDataStore from '../store/financialRiskDataStore';


/* ── Default Asset Risk Data (Fallback) ──────────────────────────────– */


/* ── Risk Level Badge ────────────────────────────────────────────── */
function RiskBadge({ level, color }) {
  const colors = {
    'VERY LOW': 'bg-emerald-100 text-emerald-700',
    'LOW': 'bg-emerald-50 text-emerald-700',
    'MEDIUM': 'bg-amber-100 text-amber-700',
    'MEDIUM-HIGH': 'bg-amber-100 text-amber-700',
    'HIGH': 'bg-red-100 text-red-700',
    'VERY HIGH': 'bg-red-100 text-red-700'
  };

  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full ${colors[level] || colors['MEDIUM']}`}>
      {level}
    </span>
  );
}

/* ── Risk Prediction Card ────────────────────────────────────────── */
function AssetRiskCard({ asset, data }) {
  const [expandedRisk, setExpandedRisk] = useState(null);

  if (!data) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6">
        <p className="text-slate-500 text-center">No risk data available for this asset</p>
      </div>
    );
  }

  const getRiskColor = (severity) => {
    if (severity === 'VERY HIGH') return 'bg-red-50 border-red-200 text-red-700';
    if (severity === 'HIGH') return 'bg-orange-50 border-orange-200 text-orange-700';
    if (severity === 'MEDIUM') return 'bg-amber-50 border-amber-200 text-amber-700';
    return 'bg-emerald-50 border-emerald-200 text-emerald-700';
  };

  const getRiskbar = (score) => {
    if (score > 7) return 'bg-red-500';
    if (score > 5) return 'bg-amber-500';
    if (score > 2) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="bg-linear-to-r from-slate-50 to-white p-6 border-b border-slate-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{data.emoji}</span>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{data.label}</h3>
              <p className="text-xs text-slate-500 mt-1">Risk Assessment & Market Predictions</p>
            </div>
          </div>
          <RiskBadge level={data.riskLevel} />
        </div>

        {/* Risk Score Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">Risk Score</span>
            <span className="text-lg font-bold text-slate-900">{data.riskScore}/10</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${getRiskbar(data.riskScore)}`} style={{ width: `${data.riskScore * 10}%` }} />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 divide-x divide-slate-200 p-6 bg-slate-50 border-b border-slate-200">
        <div className="text-center">
          <p className="text-xs text-slate-500 font-medium mb-2">Volatility</p>
          <p className="text-2xl font-bold text-slate-900">{data.volatility}</p>
          <p className="text-xs text-slate-400 mt-1">{data.volatilityDesc}</p>
        </div>
        <div className="text-center px-4">
          <p className="text-xs text-slate-500 font-medium mb-2">Max Drawdown</p>
          <p className="text-2xl font-bold text-red-600">{data.maxDrawdown}</p>
          <p className="text-xs text-slate-400 mt-1">{data.drawdownDesc}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500 font-medium mb-2">Expected Return</p>
          <p className="text-2xl font-bold text-emerald-600">{data.expectedReturn}</p>
          <p className="text-xs text-slate-400 mt-1">{data.returnDesc}</p>
        </div>
      </div>

      {/* Predicted Risks */}
      <div className="p-6 border-b border-slate-200">
        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Predicted Risks
        </h4>
        <div className="space-y-3">
          {data.predictedRisks.map((risk, idx) => (
            <div key={idx} className={`rounded-lg border p-4 cursor-pointer transition-all ${getRiskColor(risk.severity)}`} onClick={() => setExpandedRisk(expandedRisk === idx ? null : idx)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="font-semibold text-sm">{risk.type}</h5>
                  <p className="text-xs mt-1 opacity-80">{risk.description}</p>
                </div>
                <span className="text-xs font-bold ml-3 whitespace-nowrap">{risk.severity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Scenarios */}
      <div className="p-6">
        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Market Scenario Predictions
        </h4>
        <div className="space-y-3">
          {data.scenarios.map((scenario, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="flex-1">
                <p className="font-medium text-slate-800 text-sm">{scenario.condition}</p>
                <p className="text-xs text-slate-500 mt-0.5">Probability: {scenario.probability}</p>
              </div>
              <div className={`text-right font-bold text-lg ${scenario.impact.includes('-') ? 'text-red-600' : 'text-emerald-600'
                }`}>
                {scenario.impact}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Best For / Avoid If */}
      <div className="grid grid-cols-2 divide-x divide-slate-200 p-6 bg-slate-50 border-t border-slate-200">
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-2 uppercase">Best For</p>
          <p className="text-sm text-slate-700">{data.bestFor}</p>
        </div>
        <div className="pl-6">
          <p className="text-xs font-semibold text-slate-600 mb-2 uppercase">Avoid If</p>
          <p className="text-sm text-slate-700">{data.avoidIf}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Main RiskAnalysis Component ────────────────────────────────────– */
export default function RiskAnalysis() {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const { risks, isLoading, error, fetchRiskMetrics } = useRiskStore();
  const { region, setRegion, getRiskData } = useFinancialRiskDataStore();

  useEffect(() => {
    // Fetch real risk metrics from API on component mount
    fetchRiskMetrics();
  }, [fetchRiskMetrics]);

  // Use regional defaults from store
  const regionalDefaults = getRiskData(region);

  // Use real data from API, fallback to regional defaults if unavailable
  const assetRisks = {
    stocks: risks.stocks || regionalDefaults.stocks,
    mutualFunds: risks.mutualFunds || regionalDefaults.mutualFunds,
    gold: risks.gold || regionalDefaults.gold,
    bonds: risks.bonds || regionalDefaults.bonds,
    cash: risks.cash || regionalDefaults.cash,
  };


  if (isLoading) {
    return (
      <main className="text-slate-800 font-sans w-full p-4 md:p-6 lg:p-8 h-full min-h-[calc(100vh-80px)] overflow-y-auto bg-linear-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
          <div className="text-center">
            <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading real-time risk metrics...</p>
            <p className="text-slate-500 text-sm mt-1">Fetching data from Yahoo Finance & market analysis</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="text-slate-800 font-sans w-full p-4 md:p-6 lg:p-8 h-full min-h-[calc(100vh-80px)] overflow-y-auto bg-linear-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto space-y-8">



        {/* ─── Page Header ─────────────────────────────────────────────── */}
        <div className="anim-fade-up space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-100 rounded-xl">
              <Gauge className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h1 className="text-4xl font-light text-slate-800 tracking-tight">
                Asset Risk <span className="font-bold">Predictions</span>
              </h1>
              <p className="text-slate-500 text-lg mt-1">Real-time risk assessments from Previous 5 year data & AI analysis</p>
            </div>
          </div>

          {/* Region Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setRegion('india')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${region === 'india' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              🇮🇳 India Markets
            </button>
            <button
              onClick={() => setRegion('us')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${region === 'us' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              🇺🇸 US Markets
            </button>
          </div>
        </div>
        <p className="text-[15px] font-bold text-indigo-500 uppercase tracking-widest m-2 mb-4">
          Note: Below calculations are based on previous five  years of market data
        </p>

        {/* ─── Risk Introduction ──────────────────────────────────────── */}
        <div className="anim-fade-up delay-1 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex  items-start gap-4">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Understanding Asset Risk</h3>
              <p className="text-sm text-blue-800">Risk metrics below are calculated from real market data via Yahoo Finance. Volatility is annual standard deviation, drawdown represents worst-case scenarios, and expected returns are based on historical performance and AI analysis.</p>
            </div>

          </div>
        </div>

        {/* ─── Risk Comparison Summary ────────────────────────────────── */}
        <div className="anim-fade-up delay-2">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Risk Level Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(assetRisks).map(([key, data]) => (
              <button
                key={key}
                onClick={() => setSelectedAsset(key)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-center hover:shadow-md ${selectedAsset === key ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
              >
                <div className="text-3xl mb-2">{data.emoji}</div>
                <h4 className="font-bold text-slate-800 text-sm mb-2">{data.label}</h4>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full ${data.riskScore > 7 ? 'bg-red-500' :
                        data.riskScore > 5 ? 'bg-amber-500' :
                          data.riskScore > 2 ? 'bg-blue-500' :
                            'bg-emerald-500'
                      }`}
                    style={{ width: `${data.riskScore * 10}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600">{data.riskScore}/10 Risk</span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── Asset Risk Cards ───────────────────────────────────────── */}
        <div className="anim-fade-up delay-3 space-y-6">
          {Object.entries(assetRisks).map(([key, data], idx) => (
            <div key={key} className={`anim-fade-up ${`delay-${4 + idx}`}`}>
              <AssetRiskCard asset={key} data={data} />
            </div>
          ))}
        </div>

        {/* ─── Comparison Table ───────────────────────────────────────── */}
        <div className="anim-fade-up delay-9">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Risk Comparison Matrix</h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left p-4 font-bold text-slate-800">Asset Class</th>
                  <th className="text-center p-4 font-bold text-slate-800">Risk Score</th>
                  <th className="text-center p-4 font-bold text-slate-800">Volatility</th>
                  <th className="text-center p-4 font-bold text-slate-800">Max Drawdown</th>
                  <th className="text-center p-4 font-bold text-slate-800">Expected Return</th>
                  <th className="text-center p-4 font-bold text-slate-800">Best For</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(assetRisks).map(([key, data]) => (
                  <tr key={key} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{data.emoji}</span>
                        <span className="font-semibold text-slate-800">{data.label}</span>
                      </div>
                    </td>
                    <td className="text-center p-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${data.riskScore > 7 ? 'bg-red-500' :
                          data.riskScore > 5 ? 'bg-amber-500' :
                            data.riskScore > 2 ? 'bg-blue-500' :
                              'bg-emerald-500'
                        }`}>
                        {data.riskScore}
                      </span>
                    </td>
                    <td className="text-center p-4 text-slate-700 font-medium">{data.volatility}</td>
                    <td className="text-center p-4 text-red-600 font-medium">{data.maxDrawdown}</td>
                    <td className="text-center p-4 text-emerald-600 font-medium">{data.expectedReturn}</td>
                    <td className="text-center p-4 text-slate-600 text-sm">
                      {key === 'stocks' ? 'Growth' : key === 'bonds' ? 'Income' : 'Balanced'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Key Takeaways ──────────────────────────────────────────── */}
        <div className="anim-fade-up delay-10 bg-linear-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-8">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-slate-600 shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">Key Takeaways</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-lg">📈</span>
                  <span className="text-sm text-slate-700"><strong>Stocks</strong> offer highest returns but come with significant volatility and potential drawdowns.</span>
                </div>
                <div className="flex gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-lg">💼</span>
                  <span className="text-sm text-slate-700"><strong>Mutual Funds</strong> provide diversified exposure with moderate risk and reduced individual stock risk.</span>
                </div>
                <div className="flex gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-lg">🏆</span>
                  <span className="text-sm text-slate-700"><strong>Gold</strong> acts as a safe haven asset with moderate volatility and benefits during crises.</span>
                </div>
                <div className="flex gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-lg">📊</span>
                  <span className="text-sm text-slate-700"><strong>Bonds</strong> are conservative with low volatility and stable income generation.</span>
                </div>
                <div className="flex gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-lg">💵</span>
                  <span className="text-sm text-slate-700"><strong>Cash</strong> has virtually zero risk but may underperform inflation over time.</span>
                </div>
                <div className="flex gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-lg">⚖️</span>
                  <span className="text-sm text-slate-700"><strong>Diversification</strong> across all asset classes reduces overall portfolio risk while maintaining growth potential.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Data Source Info ───────────────────────────────────────── */}
        <div className="anim-fade-up delay-10 bg-slate-100 border border-slate-300 rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-600">
            📊 Risk metrics powered by Yahoo Finance API & financial AI analysis  |  Updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Spacing */}
        <div className="h-4" />
      </div>
    </main>
  );
}
