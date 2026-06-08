import React, { useEffect, useRef, useState } from 'react';

/* ── Allocation Engine ─────────────────────────────────────────── */
function computeAllocation(risk, goal, income, duration) {
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

  const raw = {};
  const keys = ['stocks', 'bonds', 'gold', 'mutualFunds', 'cash'];
  keys.forEach(k => {
    raw[k] = Math.max(2, base[k] + (goalDelta[k] || 0) + (k === durationKey ? durationBonus : 0));
  });

  const total = keys.reduce((s, k) => s + raw[k], 0);
  const scale = 100 / total;
  const normalized = {};
  let runningTotal = 0;
  keys.forEach((k, i) => {
    if (i === keys.length - 1) {
      normalized[k] = Math.round(100 - runningTotal);
    } else {
      normalized[k] = Math.round(raw[k] * scale);
      runningTotal += normalized[k];
    }
  });

  return normalized;
}

function computeReturnRange(risk, duration) {
  const base = { low: [5.0, 7.5], medium: [7.0, 10.5], high: [10.0, 15.0] }[risk] ?? [7.0, 10.5];
  const bonus = duration >= 20 ? 0.5 : 0;
  return [+(base[0] + bonus).toFixed(1), +(base[1] + bonus).toFixed(1)];
}

/* ── Static Suggestions ────────────────────────────────────────── */
const SUGGESTIONS = {
  stocks: {
    low:    ['🏦 Berkshire Hathaway (BRK.B)', '💡 iShares MSCI Min Vol ETF (USMV)', '🔵 Vanguard Dividend Appreciation ETF (VIG)'],
    medium: ['📱 Apple Inc. (AAPL)', '🔍 Alphabet Inc. (GOOGL)', '🌐 Invesco QQQ Trust (QQQ)'],
    high:   ['⚡ NVIDIA Corp. (NVDA)', '🚀 ARK Innovation ETF (ARKK)', '🛒 Tesla Inc. (TSLA)'],
  },
  bonds: {
    low:    ['🏛️ Vanguard Total Bond Market ETF (BND)', '🇺🇸 iShares TIPS Bond ETF (TIP)', '💵 Fidelity US Bond Index Fund (FXNAX)'],
    medium: ['📊 iShares Core US Aggregate Bond (AGG)', '🔐 PIMCO Income Fund (PONAX)', '🌍 Vanguard Interm-Term Bond ETF (BIV)'],
    high:   ['🔥 iShares High Yield Corp Bond (HYG)', '📈 SPDR Bloomberg High Yield (JNK)', '🌏 Vanguard Emerging Mkt Bond (VWOB)'],
  },
  gold: {
    low:    ['🥇 SPDR Gold Shares ETF (GLD)', '🏅 iShares Gold Trust (IAU)', '⚜️ VanEck Gold Miners ETF (GDX)'],
    medium: ['🥇 SPDR Gold MiniShares (GLDM)', '🏅 iShares Gold Trust (IAU)', '⛏️ Sprott Physical Gold Trust (PHYS)'],
    high:   ['🥇 SPDR Gold Shares ETF (GLD)', '⛏️ VanEck Junior Gold Miners (GDXJ)', '🌟 Barrick Gold Corp. (GOLD)'],
  },
  mutualFunds: {
    low:    ['📦 Vanguard Balanced Index Fund (VBIAX)', '🛡️ Fidelity Puritan Fund (FPURX)', '⚖️ T. Rowe Price Capital Appreciation (PRWCX)'],
    medium: ['🌱 Fidelity Contrafund (FCNTX)', '📈 Vanguard 500 Index Fund (VFIAX)', '💼 American Funds Growth Fund (AGTHX)'],
    high:   ['🚀 Fidelity Growth Company Fund (FDGRX)', '⚡ T. Rowe Price Blue Chip Growth (TRBCX)', '🌐 Morgan Stanley Growth Fund (MSEQX)'],
  },
  cash: {
    low:    ['🏦 Marcus High-Yield Savings (4.50% APY)', '📋 Ally Bank 12-Mo CD (4.80% APY)', '💳 Fidelity Government MMF (SPAXX)'],
    medium: ['🏦 Marcus High-Yield Savings (4.50% APY)', '📋 Capital One 360 CD (4.60% APY)', '💳 Schwab Value Advantage MMF (SWVXX)'],
    high:   ['💳 Fidelity Government MMF (SPAXX)', '🏦 SoFi High-Yield Savings (4.30% APY)', '📋 Treasury I-Bonds (Inflation Protected)'],
  },
};

/* ── Donut Chart ───────────────────────────────────────────────── */
const ASSET_META = [
  { key: 'stocks',      label: 'Stocks',       color: '#0d1f3d', light: '#e8ecf4' },
  { key: 'bonds',       label: 'Bonds',         color: '#2a6a3f', light: '#e8f5ee' },
  { key: 'gold',        label: 'Gold',          color: '#d97706', light: '#fef3c7' },
  { key: 'mutualFunds', label: 'Mutual Funds',  color: '#7c3aed', light: '#f3eeff' },
  { key: 'cash',        label: 'Cash / FD',     color: '#0891b2', light: '#e0f7fa' },
];

function DonutChart({ allocation }) {
  const size = 180;
  const cx = size / 2, cy = size / 2;
  const R = 72, r = 44;
  const gap = 2.4;

  const segments = ASSET_META.map(m => ({
    ...m,
    pct: allocation[m.key] ?? 0,
  }));

  const total = segments.reduce((s, seg) => s + seg.pct, 0);
  let angle = -90;

  const paths = segments.map(seg => {
    const sweep = (seg.pct / total) * (360 - gap * segments.length);
    const startDeg = angle + gap / 2;
    const endDeg = startDeg + sweep;
    angle += sweep + gap;

    const toRad = d => (d * Math.PI) / 180;
    const x1 = cx + R * Math.cos(toRad(startDeg));
    const y1 = cy + R * Math.sin(toRad(startDeg));
    const x2 = cx + R * Math.cos(toRad(endDeg));
    const y2 = cy + R * Math.sin(toRad(endDeg));
    const x3 = cx + r * Math.cos(toRad(endDeg));
    const y3 = cy + r * Math.sin(toRad(endDeg));
    const x4 = cx + r * Math.cos(toRad(startDeg));
    const y4 = cy + r * Math.sin(toRad(startDeg));
    const large = sweep > 180 ? 1 : 0;

    return {
      ...seg,
      d: `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r} ${r} 0 ${large} 0 ${x4} ${y4} Z`,
    };
  });

  const [hovered, setHovered] = useState(null);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} overflow="visible">
      {paths.map((p, i) => (
        <path
          key={p.key}
          d={p.d}
          fill={p.color}
          opacity={hovered !== null && hovered !== i ? 0.35 : 1}
          style={{
            transition: 'opacity 0.2s, transform 0.2s',
            cursor: 'pointer',
            transformOrigin: `${cx}px ${cy}px`,
            transform: hovered === i ? 'scale(1.04)' : 'scale(1)',
            filter: hovered === i ? `drop-shadow(0 0 6px ${p.color}66)` : 'none',
          }}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fontWeight="800" fill="#0d1f3d" fontFamily="Inter,sans-serif">
        {hovered !== null ? `${paths[hovered].pct}%` : '100%'}
      </text>
      <text x={cx} y={cy + 9} textAnchor="middle" fontSize="8" fontWeight="600" fill="#94a3b8" fontFamily="Inter,sans-serif">
        {hovered !== null ? paths[hovered].label.toUpperCase() : 'DIVERSIFIED'}
      </text>
    </svg>
  );
}

/* ── Bar Row ───────────────────────────────────────────────────── */
function AllocationBar({ meta, pct, animated }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), animated ? 80 + Math.random() * 120 : 0);
    return () => clearTimeout(t);
  }, [pct, animated]);

  return (
    <div className="flex items-center gap-2.5">
      {/* Color dot — color is a dynamic JS value from ASSET_META, must stay inline */}
      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: meta.color }} />
      {/* Label */}
      <span className="text-[12.5px] font-semibold text-[#0d1f3d] w-[92px] shrink-0">{meta.label}</span>
      {/* Bar track */}
      <div className="flex-1 h-[7px] rounded bg-[#f1f5f9] overflow-hidden">
        {/* Bar fill — width is animated JS state, must stay inline */}
        <div
          className="h-full rounded"
          style={{
            width: `${width}%`,
            background: meta.color,
            transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        />
      </div>
      {/* Percent — color is dynamic */}
      <span className="text-[13px] font-extrabold w-[34px] text-right shrink-0" style={{ color: meta.color }}>
        {pct}%
      </span>
    </div>
  );
}

/* ── Suggestion Chip ───────────────────────────────────────────── */
function Chip({ label, color, light }) {
  return (
    // light and color are dynamic runtime values from ASSET_META
    <div
      className="inline-flex items-center gap-1.5 px-[11px] py-[5px] rounded-full text-[11.5px] font-semibold whitespace-nowrap leading-[1.3]"
      style={{ background: light, border: `1.2px solid ${color}33`, color }}
    >
      {label}
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────────── */
export default function PortfolioAllocation({ values, calculated }) {
  const { risk, goal, income, investment, duration } = values;

  const allocation = computeAllocation(risk, goal, Number(income), Number(duration));
  const [minR, maxR] = computeReturnRange(risk, Number(duration));

  const sug = {
    stocks:      SUGGESTIONS.stocks[risk]      ?? SUGGESTIONS.stocks.medium,
    bonds:       SUGGESTIONS.bonds[risk]       ?? SUGGESTIONS.bonds.medium,
    gold:        SUGGESTIONS.gold[risk]        ?? SUGGESTIONS.gold.medium,
    mutualFunds: SUGGESTIONS.mutualFunds[risk] ?? SUGGESTIONS.mutualFunds.medium,
    cash:        SUGGESTIONS.cash[risk]        ?? SUGGESTIONS.cash.medium,
  };

  const riskLabel = { low: 'Conservative', medium: 'Moderate', high: 'Aggressive' }[risk] ?? 'Balanced';
  const goalLabel = {
    retirement: 'Retirement', wealth_growth: 'Wealth Growth',
    education: 'Education', house_purchase: 'House Purchase',
  }[goal] ?? 'Wealth Growth';

  // Risk badge colors — conditional on JS string value, cannot be static Tailwind
  const riskBg    = risk === 'low' ? '#f0fdf4' : risk === 'high' ? '#fef2f2' : '#fffbeb';
  const riskColor = risk === 'low' ? '#16a34a' : risk === 'high' ? '#dc2626' : '#d97706';
  const riskBorder= risk === 'low' ? '#bbf7d0' : risk === 'high' ? '#fecaca' : '#fde68a';

  return (
    <div className="mt-6">
      {/* ── Section Header ── */}
      <div className="mb-4">
        <div className="text-[10.5px] font-bold text-[#2a6a3f] tracking-[0.14em] mb-1.5">
          PORTFOLIO ALLOCATION
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-[20px] font-extrabold text-[#0d1f3d] tracking-[-0.02em]">
            Optimal Portfolio Mix
          </h2>
          <div className="flex gap-1.5">
            <span
              className="px-[10px] py-[3px] rounded-full text-[11px] font-bold border"
              style={{ background: riskBg, color: riskColor, borderColor: riskBorder }}
            >
              {riskLabel}
            </span>
            <span className="px-[10px] py-[3px] rounded-full text-[11px] font-bold bg-[#f0f4ff] text-[#4361ee] border border-[#c7d2fe]">
              {goalLabel}
            </span>
          </div>
        </div>
      </div>

      {/* ── Card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">

        {/* Top: Donut + Bars */}
        <div className="grid grid-cols-[200px_1fr]">
          {/* Donut side */}
          <div className="flex flex-col items-center justify-center py-7 px-4 bg-[#f8fafc] border-r border-slate-200">
            <DonutChart allocation={allocation} animated={calculated} />
            <div className="mt-2.5 text-[10px] font-bold text-slate-400 tracking-[0.1em]">
              HOVER TO EXPLORE
            </div>
          </div>

          {/* Bars side */}
          <div className="px-7 py-6 flex flex-col gap-[13px] justify-center">
            {ASSET_META.map(meta => (
              <AllocationBar key={meta.key} meta={meta} pct={allocation[meta.key]} animated={calculated} />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-200" />

        {/* Expected Return Banner */}
        <div
          className="flex items-center justify-between flex-wrap gap-4 px-7 py-4"
          style={{ background: 'linear-gradient(135deg, #0d2142 0%, #0d1f3d 100%)' }}
        >
          <div>
            <div className="text-[10px] font-bold text-white/45 tracking-[0.12em] mb-[3px]">
              EXPECTED ANNUAL RETURN
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[28px] font-black text-[#5dde8a] leading-none tracking-[-0.02em]">
                {minR}% – {maxR}%
              </span>
              <span className="text-[11px] text-white/40 font-medium">annualised estimate</span>
            </div>
          </div>
          <div className="px-[18px] py-2.5 rounded-[10px] bg-white/[0.07] border border-white/[0.12] max-w-[340px]">
            <p className="text-[11.5px] text-white/60 leading-[1.65] italic">
              {risk === 'low'
                ? '🛡️ Capital-preservation focus. Stable bonds & gold hedge against volatility.'
                : risk === 'high'
                ? '🚀 Growth-first strategy. High equity concentration suits your long horizon.'
                : '⚖️ Balanced diversification across growth & defensive assets.'}
              {' '}Duration of <strong className="text-white">{duration} years</strong> amplifies compounding power.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-200" />

        {/* Investment Suggestions */}
        <div className="px-7 py-6">
          <div className="text-[10.5px] font-bold text-slate-400 tracking-[0.1em] mb-4">
            RECOMMENDED INSTRUMENTS
          </div>

          <div className="flex flex-col gap-3.5">
            {ASSET_META.map(meta => (
              <div key={meta.key} className="flex gap-3.5 items-start flex-wrap">
                {/* Asset label */}
                <div className="flex items-center gap-[7px] min-w-[120px] shrink-0 pt-0.5">
                  {/* Dot — dynamic color */}
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: meta.color }} />
                  <span className="text-[12px] font-bold text-slate-500 tracking-[0.04em]">
                    {meta.label.toUpperCase()}
                  </span>
                </div>
                {/* Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {sug[meta.key].map((s, i) => (
                    <Chip key={i} label={s} color={meta.color} light={meta.light} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-200" />

        {/* Disclaimer */}
        <div className="px-7 py-3 bg-[#f8fafc]">
          <p className="text-[10.5px] text-slate-400 leading-[1.6]">
            ⚠️ <strong>Disclaimer:</strong> This portfolio recommendation is generated algorithmically based on the inputs provided
            and is for <strong>informational purposes only</strong>. It does not constitute financial advice.
            Past performance is not indicative of future results. Please consult a certified financial advisor before investing.
          </p>
        </div>
      </div>
    </div>
  );
}
