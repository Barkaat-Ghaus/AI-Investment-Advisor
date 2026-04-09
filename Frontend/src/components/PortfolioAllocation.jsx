import React, { useEffect, useRef, useState } from 'react';

/* ── Allocation Engine ─────────────────────────────────────────── */
/**
 * Determines portfolio split (total = 100) based on:
 *  - risk:  'low' | 'medium' | 'high'
 *  - goal:  'retirement' | 'wealth_growth' | 'education' | 'house_purchase'
 *  - income (monthly, numeric)
 *  - duration (years, numeric)
 */
function computeAllocation(risk, goal, income, duration) {
  // Base allocations by risk
  const base = {
    low:    { stocks: 20, bonds: 35, gold: 15, mutualFunds: 15, cash: 15 },
    medium: { stocks: 40, bonds: 20, gold: 10, mutualFunds: 22, cash:  8 },
    high:   { stocks: 65, bonds:  8, gold:  7, mutualFunds: 16, cash:  4 },
  }[risk] ?? { stocks: 40, bonds: 20, gold: 10, mutualFunds: 22, cash: 8 };

  // Goal tweaks (additive deltas, normalised later)
  const goalDelta = {
    retirement:    { stocks: -5,  bonds: +8,  gold: +2,  mutualFunds: -3, cash: -2 },
    wealth_growth: { stocks: +8,  bonds: -5,  gold: -1,  mutualFunds: +2, cash: -4 },
    education:     { stocks: -3,  bonds: +5,  gold: 0,   mutualFunds: +3, cash: -5 },
    house_purchase:{ stocks: -8,  bonds: +2,  gold: 0,   mutualFunds: -2, cash: +8 },
  }[goal] ?? { stocks: 0, bonds: 0, gold: 0, mutualFunds: 0, cash: 0 };

  // Duration tweak: longer horizon → tilt toward growth
  const durationBonus = duration >= 20 ? 5 : duration >= 10 ? 2 : 0;
  const durationKey = risk === 'low' ? 'bonds' : risk === 'high' ? 'stocks' : 'mutualFunds';

  const raw = {};
  const keys = ['stocks', 'bonds', 'gold', 'mutualFunds', 'cash'];
  keys.forEach(k => {
    raw[k] = Math.max(2, base[k] + (goalDelta[k] || 0) + (k === durationKey ? durationBonus : 0));
  });

  // Normalise to exactly 100
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

function DonutChart({ allocation, animated }) {
  const size = 180;
  const cx = size / 2, cy = size / 2;
  const R = 72, r = 44;
  const gap = 2.4;

  const segments = ASSET_META.map(m => ({
    ...m,
    pct: allocation[m.key] ?? 0,
  }));

  const total = segments.reduce((s, seg) => s + seg.pct, 0);
  let angle = -90; // start at top

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
          fill={hovered === i ? p.color : p.color}
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
      {/* Center label */}
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* Color dot */}
      <div style={{
        width: 10, height: 10, borderRadius: '50%', background: meta.color, flexShrink: 0,
      }} />
      {/* Label */}
      <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0d1f3d', width: 92, flexShrink: 0 }}>
        {meta.label}
      </span>
      {/* Bar */}
      <div style={{ flex: 1, height: 7, borderRadius: 4, background: '#f1f5f9', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${width}%`, background: meta.color,
          borderRadius: 4, transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      </div>
      {/* Percent */}
      <span style={{ fontSize: 13, fontWeight: 800, color: meta.color, width: 34, textAlign: 'right', flexShrink: 0 }}>
        {pct}%
      </span>
    </div>
  );
}

/* ── Suggestion Chip ───────────────────────────────────────────── */
function Chip({ label, color, light }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 11px', borderRadius: 999,
      background: light, border: `1.2px solid ${color}33`,
      fontSize: 11.5, fontWeight: 600, color, lineHeight: 1.3,
      whiteSpace: 'nowrap',
    }}>
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

  return (
    <div style={{ marginTop: 24 }}>

      {/* ── Section Header ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: '#2a6a3f', letterSpacing: '0.14em', marginBottom: 6 }}>
          PORTFOLIO ALLOCATION
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0d1f3d', letterSpacing: '-0.02em' }}>
            Optimal Portfolio Mix
          </h2>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{
              padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
              background: risk === 'low' ? '#f0fdf4' : risk === 'high' ? '#fef2f2' : '#fffbeb',
              color: risk === 'low' ? '#16a34a' : risk === 'high' ? '#dc2626' : '#d97706',
              border: `1px solid ${risk === 'low' ? '#bbf7d0' : risk === 'high' ? '#fecaca' : '#fde68a'}`,
            }}>
              {riskLabel}
            </span>
            <span style={{
              padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
              background: '#f0f4ff', color: '#4361ee',
              border: '1px solid #c7d2fe',
            }}>
              {goalLabel}
            </span>
          </div>
        </div>
      </div>

      {/* ── Card ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}>

        {/* Top: Donut + Bars */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          gap: 0,
        }}>

          {/* Donut side */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '28px 16px',
            background: '#f8fafc',
            borderRight: '1px solid #e2e8f0',
          }}>
            <DonutChart allocation={allocation} animated={calculated} />
            <div style={{ marginTop: 10, fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em' }}>
              HOVER TO EXPLORE
            </div>
          </div>

          {/* Bars side */}
          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 13, justifyContent: 'center' }}>
            {ASSET_META.map(meta => (
              <AllocationBar key={meta.key} meta={meta} pct={allocation[meta.key]} animated={calculated} />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#e2e8f0' }} />

        {/* Expected Return Banner */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
          padding: '16px 28px', gap: 16,
          background: 'linear-gradient(135deg, #0d2142 0%, #0d1f3d 100%)',
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', marginBottom: 3 }}>
              EXPECTED ANNUAL RETURN
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: '#5dde8a', lineHeight: 1, letterSpacing: '-0.02em' }}>
                {minR}% – {maxR}%
              </span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                annualised estimate
              </span>
            </div>
          </div>
          <div style={{
            padding: '10px 18px', borderRadius: 10,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            maxWidth: 340,
          }}>
            <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, fontStyle: 'italic' }}>
              {risk === 'low'
                ? '🛡️ Capital-preservation focus. Stable bonds & gold hedge against volatility.'
                : risk === 'high'
                ? '🚀 Growth-first strategy. High equity concentration suits your long horizon.'
                : '⚖️ Balanced diversification across growth & defensive assets.'}
              {' '}Duration of <strong style={{ color: '#ffffff' }}>{duration} years</strong> amplifies compounding power.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#e2e8f0' }} />

        {/* Investment Suggestions */}
        <div style={{ padding: '24px 28px' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', marginBottom: 16 }}>
            RECOMMENDED INSTRUMENTS
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {ASSET_META.map(meta => (
              <div key={meta.key} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {/* Asset label */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  minWidth: 120, flexShrink: 0, paddingTop: 2,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', letterSpacing: '0.04em' }}>
                    {meta.label.toUpperCase()}
                  </span>
                </div>
                {/* Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {sug[meta.key].map((s, i) => (
                    <Chip key={i} label={s} color={meta.color} light={meta.light} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#e2e8f0' }} />

        {/* Disclaimer */}
        <div style={{ padding: '12px 28px', background: '#f8fafc' }}>
          <p style={{ fontSize: 10.5, color: '#94a3b8', lineHeight: 1.6 }}>
            ⚠️ <strong>Disclaimer:</strong> This portfolio recommendation is generated algorithmically based on the inputs provided
            and is for <strong>informational purposes only</strong>. It does not constitute financial advice.
            Past performance is not indicative of future results. Please consult a certified financial advisor before investing.
          </p>
        </div>
      </div>
    </div>
  );
}
