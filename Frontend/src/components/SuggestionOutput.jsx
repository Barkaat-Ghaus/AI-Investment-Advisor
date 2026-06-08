import React, { useState, useEffect, useRef } from 'react';

/* ── Shared engine (mirrors PortfolioAllocation.jsx) ──────────── */
function computeAllocation(risk, goal, duration) {
  const base = {
    low:    { stocks: 20, bonds: 35, gold: 15, mutualFunds: 15, cash: 15 },
    medium: { stocks: 40, bonds: 20, gold: 10, mutualFunds: 22, cash:  8 },
    high:   { stocks: 65, bonds:  8, gold:  7, mutualFunds: 16, cash:  4 },
  }[risk] ?? { stocks: 40, bonds: 20, gold: 10, mutualFunds: 22, cash: 8 };

  const goalDelta = {
    retirement:    { stocks: -5,  bonds: +8,  gold: +2,  mutualFunds: -3, cash: -2 },
    wealth_growth: { stocks: +8,  bonds: -5,  gold: -1,  mutualFunds: +2, cash: -4 },
    education:     { stocks: -3,  bonds: +5,  gold: 0,   mutualFunds: +3, cash: -5 },
    house_purchase:{ stocks: -8,  bonds: +2,  gold: 0,   mutualFunds: -2, cash: +8 },
  }[goal] ?? { stocks: 0, bonds: 0, gold: 0, mutualFunds: 0, cash: 0 };

  const durationBonus = duration >= 20 ? 5 : duration >= 10 ? 2 : 0;
  const durationKey = risk === 'low' ? 'bonds' : risk === 'high' ? 'stocks' : 'mutualFunds';

  const keys = ['stocks', 'bonds', 'gold', 'mutualFunds', 'cash'];
  const raw = {};
  keys.forEach(k => {
    raw[k] = Math.max(2, base[k] + (goalDelta[k] || 0) + (k === durationKey ? durationBonus : 0));
  });

  const total = keys.reduce((s, k) => s + raw[k], 0);
  const scale = 100 / total;
  const out = {};
  let running = 0;
  keys.forEach((k, i) => {
    if (i === keys.length - 1) { out[k] = Math.round(100 - running); }
    else { out[k] = Math.round(raw[k] * scale); running += out[k]; }
  });
  return out;
}

function computeReturnRange(risk, duration) {
  const base = { low: [5.0, 7.5], medium: [7.0, 10.5], high: [10.0, 15.0] }[risk] ?? [7.0, 10.5];
  const bonus = duration >= 20 ? 0.5 : 0;
  return [+(base[0] + bonus).toFixed(1), +(base[1] + bonus).toFixed(1)];
}

const SUGGESTIONS = {
  stocks: {
    low:    ['Berkshire Hathaway (BRK.B)', 'iShares MSCI Min Vol ETF (USMV)', 'Vanguard Dividend Appreciation ETF (VIG)'],
    medium: ['Apple Inc. (AAPL)', 'Alphabet Inc. (GOOGL)', 'Invesco QQQ Trust (QQQ)'],
    high:   ['NVIDIA Corp. (NVDA)', 'ARK Innovation ETF (ARKK)', 'Tesla Inc. (TSLA)'],
  },
  bonds: {
    low:    ['Vanguard Total Bond Market ETF (BND)', 'iShares TIPS Bond ETF (TIP)', 'Fidelity US Bond Index Fund (FXNAX)'],
    medium: ['iShares Core US Aggregate Bond (AGG)', 'PIMCO Income Fund (PONAX)', 'Vanguard Interm-Term Bond ETF (BIV)'],
    high:   ['iShares High Yield Corp Bond (HYG)', 'SPDR Bloomberg High Yield (JNK)', 'Vanguard Emerging Mkt Bond (VWOB)'],
  },
  gold: {
    low:    ['SPDR Gold Shares ETF (GLD)', 'iShares Gold Trust (IAU)', 'VanEck Gold Miners ETF (GDX)'],
    medium: ['SPDR Gold MiniShares (GLDM)', 'iShares Gold Trust (IAU)', 'Sprott Physical Gold Trust (PHYS)'],
    high:   ['SPDR Gold Shares ETF (GLD)', 'VanEck Junior Gold Miners (GDXJ)', 'Barrick Gold Corp. (GOLD)'],
  },
  mutualFunds: {
    low:    ['Vanguard Balanced Index Fund (VBIAX)', 'Fidelity Puritan Fund (FPURX)', 'T. Rowe Price Capital Appreciation (PRWCX)'],
    medium: ['Fidelity Contrafund (FCNTX)', 'Vanguard 500 Index Fund (VFIAX)', 'American Funds Growth Fund (AGTHX)'],
    high:   ['Fidelity Growth Company Fund (FDGRX)', 'T. Rowe Price Blue Chip Growth (TRBCX)', 'Morgan Stanley Growth Fund (MSEQX)'],
  },
  cash: {
    low:    ['Marcus High-Yield Savings (4.50% APY)', 'Ally Bank 12-Mo CD (4.80% APY)', 'Fidelity Government MMF (SPAXX)'],
    medium: ['Marcus High-Yield Savings (4.50% APY)', 'Capital One 360 CD (4.60% APY)', 'Schwab Value Advantage MMF (SWVXX)'],
    high:   ['Fidelity Government MMF (SPAXX)', 'SoFi High-Yield Savings (4.30% APY)', 'Treasury I-Bonds (Inflation Protected)'],
  },
};

const ASSET_META = [
  { key: 'stocks',      label: 'Stocks',      icon: '📈', color: '#0d1f3d', light: '#e8ecf4', tag: 'Equities'     },
  { key: 'bonds',       label: 'Bonds',       icon: '🏛️', color: '#2a6a3f', light: '#e8f5ee', tag: 'Fixed Income' },
  { key: 'gold',        label: 'Gold',        icon: '🥇', color: '#d97706', light: '#fef3c7', tag: 'Commodity'    },
  { key: 'mutualFunds', label: 'Mutual Funds',icon: '💼', color: '#7c3aed', light: '#f3eeff', tag: 'Diversified'  },
  { key: 'cash',        label: 'Cash / FD',   icon: '🏦', color: '#0891b2', light: '#e0f7fa', tag: 'Safe Haven'   },
];

/* ── Copy-to-clipboard hook ───────────────────────────────────── */
function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return [copied, copy];
}

/* ── Animated number ──────────────────────────────────────────── */
function AnimNum({ target, suffix = '%', duration = 700 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.round(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return <>{val}{suffix}</>;
}

/* ── Allocation row with micro-bar ───────────────────────────── */
function AllocRow({ meta, pct, delay }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div className="grid grid-cols-[28px_110px_1fr_52px] items-center gap-2.5 py-2.5 border-b border-[#f1f5f9]">
      <span className="text-[16px]">{meta.icon}</span>

      <div>
        <div className="text-[13px] font-bold text-[#0d1f3d]">{meta.label}</div>
        {/* tag color is dynamic asset value */}
        <div className="text-[10px] font-semibold tracking-[0.05em]" style={{ color: meta.color }}>{meta.tag}</div>
      </div>

      {/* Bar track */}
      <div className="h-2 rounded-[6px] bg-[#f1f5f9] overflow-hidden">
        {/* Bar fill — width is animated JS state and color is dynamic */}
        <div
          className="h-full rounded-[6px]"
          style={{
            width: `${w}%`,
            background: `linear-gradient(90deg, ${meta.color}cc, ${meta.color})`,
            transition: 'width 0.9s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        />
      </div>

      {/* Percent badge — color is dynamic */}
      <div className="text-right text-[15px] font-black" style={{ color: meta.color }}>
        <AnimNum target={pct} />
      </div>
    </div>
  );
}

/* ── Suggestion row ───────────────────────────────────────────── */
function SugRow({ meta, items }) {
  return (
    <div className="grid grid-cols-[28px_110px_1fr] gap-2.5 py-2.5 border-b border-[#f1f5f9] items-start">
      <span className="text-[16px] pt-[1px]">{meta.icon}</span>
      <div className="text-[12px] font-bold text-slate-500 tracking-[0.04em] pt-[3px]">
        {meta.label.toUpperCase()}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          // light and color are dynamic values from ASSET_META
          <span
            key={i}
            className="px-2.5 py-1 rounded-full text-[11.5px] font-semibold whitespace-nowrap leading-[1.4]"
            style={{
              background: meta.light,
              border: `1.2px solid ${meta.color}33`,
              color: meta.color,
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Plain-text generator (for clipboard) ─────────────────────── */
function buildPlainText(allocation, minR, maxR, sug, riskLabel, goalLabel, duration) {
  const lines = [
    `═══════════════════════════════════════`,
    `   PORTFOLIO SUGGESTION REPORT`,
    `   Profile: ${riskLabel} Risk · ${goalLabel} · ${duration}yr horizon`,
    `═══════════════════════════════════════`,
    ``,
    `PORTFOLIO ALLOCATION:`,
    `  Stocks       : ${allocation.stocks}%`,
    `  Bonds        : ${allocation.bonds}%`,
    `  Gold         : ${allocation.gold}%`,
    `  Mutual Funds : ${allocation.mutualFunds}%`,
    `  Cash / FD    : ${allocation.cash}%`,
    `  ─────────────────────`,
    `  Total        : 100%`,
    ``,
    `EXPECTED RETURN:`,
    `  Estimated annual return range: ${minR}% – ${maxR}%`,
    ``,
    `INVESTMENT SUGGESTIONS:`,
    `  Stocks       : ${sug.stocks.join(' | ')}`,
    `  Bonds        : ${sug.bonds.join(' | ')}`,
    `  Gold         : ${sug.gold.join(' | ')}`,
    `  Mutual Funds : ${sug.mutualFunds.join(' | ')}`,
    `  Cash / FD    : ${sug.cash.join(' | ')}`,
    ``,
    `─────────────────────────────────────────`,
    `⚠ Disclaimer: For informational purposes only.`,
    `  Not financial advice. Past performance is not`,
    `  indicative of future results.`,
    `─────────────────────────────────────────`,
    `Generated by Equilibrium Finance · ${new Date().toLocaleDateString()}`,
  ];
  return lines.join('\n');
}

/* ══════════════════════════════════════════════════════════════ */
/*  MAIN EXPORT                                                   */
/* ══════════════════════════════════════════════════════════════ */
export default function SuggestionOutput({ values, visible }) {
  const { risk, goal, duration } = values;
  const allocation = computeAllocation(risk, goal, Number(duration));
  const [minR, maxR] = computeReturnRange(risk, Number(duration));

  const sug = {
    stocks:      SUGGESTIONS.stocks[risk]      ?? SUGGESTIONS.stocks.medium,
    bonds:       SUGGESTIONS.bonds[risk]       ?? SUGGESTIONS.bonds.medium,
    gold:        SUGGESTIONS.gold[risk]        ?? SUGGESTIONS.gold.medium,
    mutualFunds: SUGGESTIONS.mutualFunds[risk] ?? SUGGESTIONS.mutualFunds.medium,
    cash:        SUGGESTIONS.cash[risk]        ?? SUGGESTIONS.cash.medium,
  };

  const riskLabel = { low: 'Conservative', medium: 'Moderate', high: 'Aggressive' }[risk] ?? 'Moderate';
  const goalLabel = {
    retirement: 'Retirement', wealth_growth: 'Wealth Growth',
    education: 'Education', house_purchase: 'House Purchase',
  }[goal] ?? 'Wealth Growth';

  const plainText = buildPlainText(allocation, minR, maxR, sug, riskLabel, goalLabel, duration);
  const [copied, copy] = useCopy();

  const cardRef = useRef(null);

  useEffect(() => {
    if (visible && cardRef.current) {
      setTimeout(() => {
        cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={cardRef}
      className="mt-7"
      style={{ animation: 'suggestionReveal 0.55s cubic-bezier(0.34,1.56,0.64,1) both' }}
    >
      {/* ── Section eyebrow ── */}
      <div className="mb-3.5">
        <div className="text-[10.5px] font-bold text-[#2a6a3f] tracking-[0.14em] mb-1.5">
          SUGGESTION OUTPUT
        </div>
        <div className="flex items-center justify-between flex-wrap gap-2.5">
          <h2 className="text-[20px] font-extrabold text-[#0d1f3d] tracking-[-0.02em]">
            Your Portfolio Report
          </h2>

          {/* Action buttons */}
          <div className="flex gap-2">
            {/* Copy */}
            <button
              id="btn-copy-report"
              onClick={() => copy(plainText)}
              className={`flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12px] font-bold cursor-pointer transition-all
                border-[1.5px] ${copied
                  ? 'bg-[#f0fdf4] border-[#86efac] text-[#16a34a]'
                  : 'bg-[#f8fafc] border-slate-200 text-slate-500'
                }`}
            >
              {copied ? (
                <>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy Report
                </>
              )}
            </button>

            {/* Print */}
            <button
              id="btn-print-report"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg bg-[#0d1f3d] border-[1.5px] border-[#0d1f3d] text-white text-[12px] font-bold cursor-pointer transition-all hover:bg-[#1a3560]"
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print / Export
            </button>
          </div>
        </div>
      </div>

      {/* ── Report card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.07)] overflow-hidden">

        {/* ── Header strip ── */}
        <div
          className="flex items-center justify-between gap-3 flex-wrap px-7 py-5"
          style={{ background: 'linear-gradient(135deg, #0d2142 0%, #0d1f3d 100%)' }}
        >
          <div>
            <div className="text-[10px] font-bold text-white/40 tracking-[0.12em] mb-1">
              EQUILIBRIUM FINANCE · PORTFOLIO REPORT
            </div>
            <div className="text-[16px] font-extrabold text-white">
              {riskLabel} Risk Profile &mdash; {goalLabel}
            </div>
            <div className="text-[11px] text-white/45 mt-[3px]">
              {duration}-year investment horizon · Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div className="px-[18px] py-2.5 rounded-[10px] bg-white/[0.07] border border-white/[0.12]">
            <div className="text-[9px] font-bold text-white/40 tracking-[0.1em] mb-[3px]">EXPECTED ANNUAL RETURN</div>
            <div className="text-[26px] font-black text-[#5dde8a] leading-none tracking-[-0.02em]">
              {minR}% – {maxR}%
            </div>
          </div>
        </div>

        {/* ── Section 1: Portfolio Allocation ── */}
        <div className="px-7 pt-6 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-[#f0f4ff] flex items-center justify-center text-[14px] shrink-0">📊</div>
            <div>
              <div className="text-[13px] font-extrabold text-[#0d1f3d]">Portfolio Allocation</div>
              <div className="text-[10.5px] text-slate-400">Percentage split across asset classes</div>
            </div>
          </div>

          <div className="flex flex-col">
            {ASSET_META.map((meta, i) => (
              <AllocRow key={meta.key} meta={meta} pct={allocation[meta.key]} delay={i * 80} />
            ))}
          </div>

          {/* Total row */}
          <div className="flex justify-end items-center gap-2 pt-2.5 pb-1">
            <span className="text-[11px] font-semibold text-slate-400">TOTAL</span>
            <span className="px-3 py-[3px] rounded-full bg-[#f0fdf4] border border-[#86efac] text-[12px] font-extrabold text-[#16a34a]">
              100%
            </span>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-slate-200 mx-7" />

        {/* ── Section 2: Expected Return detail ── */}
        <div className="px-7 py-5">
          <div className="flex items-center gap-2 mb-3.5">
            <div className="w-7 h-7 rounded-lg bg-[#fff7ed] flex items-center justify-center text-[14px] shrink-0">📈</div>
            <div>
              <div className="text-[13px] font-extrabold text-[#0d1f3d]">Expected Return</div>
              <div className="text-[10.5px] text-slate-400">Annualised estimate based on your profile</div>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            {/* Conservative */}
            <div className="flex-1 min-w-[140px] px-[18px] py-3.5 rounded-xl bg-[#f8fafc] border-[1.5px] border-slate-200">
              <div className="text-[9px] font-bold text-slate-400 tracking-[0.1em] mb-1.5">CONSERVATIVE ESTIMATE</div>
              <div className="text-[28px] font-black text-[#0d1f3d] leading-none">
                {minR}% <span className="text-[12px] text-slate-400">p.a.</span>
              </div>
            </div>
            {/* Optimistic */}
            <div
              className="flex-1 min-w-[140px] px-[18px] py-3.5 rounded-xl border-[1.5px] border-[#1a3560]"
              style={{ background: 'linear-gradient(135deg, #0d2142, #0d1f3d)' }}
            >
              <div className="text-[9px] font-bold text-white/40 tracking-[0.1em] mb-1.5">OPTIMISTIC ESTIMATE</div>
              <div className="text-[28px] font-black text-[#5dde8a] leading-none">
                {maxR}% <span className="text-[12px] text-white/40">p.a.</span>
              </div>
            </div>
            {/* Range */}
            <div className="flex flex-col justify-center flex-1 min-w-[140px] px-[18px] py-3.5 rounded-xl bg-[#f0fdf4] border-[1.5px] border-[#bbf7d0]">
              <div className="text-[9px] font-bold text-[#16a34a] tracking-[0.1em] mb-1.5">ESTIMATED RANGE</div>
              <div className="text-[20px] font-black text-[#16a34a] leading-none">
                {minR}% – {maxR}%
              </div>
              <div className="text-[10px] text-[#86efac] mt-1">per annum, annualised</div>
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-slate-200 mx-7" />

        {/* ── Section 3: Investment Suggestions ── */}
        <div className="px-7 py-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-[#f5f3ff] flex items-center justify-center text-[14px] shrink-0">💡</div>
            <div>
              <div className="text-[13px] font-extrabold text-[#0d1f3d]">Investment Suggestions</div>
              <div className="text-[10.5px] text-slate-400">2–3 recommended instruments per asset class</div>
            </div>
          </div>

          <div className="flex flex-col">
            {ASSET_META.map(meta => (
              <SugRow key={meta.key} meta={meta} items={sug[meta.key]} />
            ))}
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-slate-200" />

        {/* ── Plain-text preview panel ── */}
        <div className="px-7 py-5 bg-[#f8fafc]">
          <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
            <div className="text-[11px] font-bold text-slate-500 tracking-[0.06em]">
              📋 PLAIN TEXT OUTPUT — Copy this to use anywhere
            </div>
            <button
              id="btn-copy-text"
              onClick={() => copy(plainText)}
              className={`px-3 py-[5px] rounded-[6px] border-[1.5px] border-slate-200 text-[11px] font-bold cursor-pointer transition-all
                ${copied ? 'bg-[#f0fdf4] text-[#16a34a]' : 'bg-white text-slate-500'}`}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <pre className="font-mono text-[11.5px] leading-[1.75] text-slate-700 bg-white border border-slate-200 rounded-xl p-5 overflow-x-auto whitespace-pre select-all">
{`Portfolio Allocation:
  Stocks       : ${allocation.stocks}%
  Bonds        : ${allocation.bonds}%
  Gold         : ${allocation.gold}%
  Mutual Funds : ${allocation.mutualFunds}%
  Cash/FD      : ${allocation.cash}%

Expected Return:
  Estimated annual return range: ${minR}% – ${maxR}%

Investment Suggestions:
  Stocks       : ${sug.stocks.join(', ')}
  Bonds        : ${sug.bonds.join(', ')}
  Gold         : ${sug.gold.join(', ')}
  Mutual Funds : ${sug.mutualFunds.join(', ')}
  Cash/FD      : ${sug.cash.join(', ')}`}
          </pre>
        </div>

        {/* ── Disclaimer ── */}
        <div className="px-7 py-3 bg-[#fffbeb] border-t border-[#fde68a]">
          <p className="text-[10.5px] text-[#92400e] leading-[1.6]">
            ⚠️ <strong>Disclaimer:</strong> This suggestion report is generated algorithmically based on inputs provided and is for{' '}
            <strong>informational purposes only</strong>. It does not constitute personalised financial advice.
            Please consult a certified financial advisor before making investment decisions.
          </p>
        </div>
      </div>

      {/* ── Keyframe injection ── */}
      <style>{`
        @keyframes suggestionReveal {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)  scale(1);    }
        }
      `}</style>
    </div>
  );
}
