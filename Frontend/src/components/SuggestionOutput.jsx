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
  { key: 'stocks',      label: 'Stocks',      icon: '📈', color: '#0d1f3d', light: '#e8ecf4', tag: 'Equities'       },
  { key: 'bonds',       label: 'Bonds',       icon: '🏛️', color: '#2a6a3f', light: '#e8f5ee', tag: 'Fixed Income'   },
  { key: 'gold',        label: 'Gold',        icon: '🥇', color: '#d97706', light: '#fef3c7', tag: 'Commodity'      },
  { key: 'mutualFunds', label: 'Mutual Funds',icon: '💼', color: '#7c3aed', light: '#f3eeff', tag: 'Diversified'    },
  { key: 'cash',        label: 'Cash / FD',   icon: '🏦', color: '#0891b2', light: '#e0f7fa', tag: 'Safe Haven'     },
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
    <div style={{
      display: 'grid',
      gridTemplateColumns: '28px 110px 1fr 52px',
      alignItems: 'center',
      gap: 10,
      padding: '10px 0',
      borderBottom: '1px solid #f1f5f9',
    }}>
      {/* Icon */}
      <span style={{ fontSize: 16 }}>{meta.icon}</span>

      {/* Label + tag */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0d1f3d' }}>{meta.label}</div>
        <div style={{ fontSize: 10, fontWeight: 600, color: meta.color, letterSpacing: '0.05em' }}>{meta.tag}</div>
      </div>

      {/* Bar */}
      <div style={{ height: 8, borderRadius: 6, background: '#f1f5f9', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${w}%`,
          background: `linear-gradient(90deg, ${meta.color}cc, ${meta.color})`,
          borderRadius: 6,
          transition: 'width 0.9s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      </div>

      {/* Percent badge */}
      <div style={{
        textAlign: 'right',
        fontSize: 15,
        fontWeight: 900,
        color: meta.color,
      }}>
        <AnimNum target={pct} />
      </div>
    </div>
  );
}

/* ── Suggestion row ───────────────────────────────────────────── */
function SugRow({ meta, items }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '28px 110px 1fr',
      gap: 10,
      padding: '10px 0',
      borderBottom: '1px solid #f1f5f9',
      alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: 16, paddingTop: 1 }}>{meta.icon}</span>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', letterSpacing: '0.04em', paddingTop: 3 }}>
        {meta.label.toUpperCase()}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {items.map((item, i) => (
          <span key={i} style={{
            padding: '4px 10px',
            borderRadius: 999,
            background: meta.light,
            border: `1.2px solid ${meta.color}33`,
            fontSize: 11.5,
            fontWeight: 600,
            color: meta.color,
            lineHeight: 1.4,
            whiteSpace: 'nowrap',
          }}>
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

  // Smooth scroll into view when the card becomes visible
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
      style={{
        marginTop: 28,
        animation: 'suggestionReveal 0.55s cubic-bezier(0.34,1.56,0.64,1) both',
      }}
    >
      {/* ── Section eyebrow ── */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          fontSize: 10.5, fontWeight: 700, color: '#2a6a3f',
          letterSpacing: '0.14em', marginBottom: 6,
        }}>
          SUGGESTION OUTPUT
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0d1f3d', letterSpacing: '-0.02em' }}>
            Your Portfolio Report
          </h2>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {/* Copy */}
            <button
              id="btn-copy-report"
              onClick={() => copy(plainText)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 8,
                background: copied ? '#f0fdf4' : '#f8fafc',
                border: `1.5px solid ${copied ? '#86efac' : '#e2e8f0'}`,
                color: copied ? '#16a34a' : '#475569',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
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
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 8,
                background: '#0d1f3d',
                border: '1.5px solid #0d1f3d',
                color: '#ffffff',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1a3560'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#0d1f3d'; }}
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
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        overflow: 'hidden',
      }}>

        {/* ── Header strip ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0d2142 0%, #0d1f3d 100%)',
          padding: '20px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', marginBottom: 4 }}>
              EQUILIBRIUM FINANCE · PORTFOLIO REPORT
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
              {riskLabel} Risk Profile &mdash; {goalLabel}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>
              {duration}-year investment horizon · Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div style={{
            padding: '10px 18px', borderRadius: 10,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: 3 }}>
              EXPECTED ANNUAL RETURN
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#5dde8a', lineHeight: 1, letterSpacing: '-0.02em' }}>
              {minR}% – {maxR}%
            </div>
          </div>
        </div>

        {/* ── Section 1: Portfolio Allocation ── */}
        <div style={{ padding: '24px 28px 8px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 4,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: '#f0f4ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, flexShrink: 0,
            }}>
              📊
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0d1f3d' }}>Portfolio Allocation</div>
              <div style={{ fontSize: 10.5, color: '#94a3b8' }}>Percentage split across asset classes</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {ASSET_META.map((meta, i) => (
              <AllocRow key={meta.key} meta={meta} pct={allocation[meta.key]} delay={i * 80} />
            ))}
          </div>

          {/* Total row */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
            gap: 8, paddingTop: 10, paddingBottom: 4,
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>TOTAL</span>
            <span style={{
              padding: '3px 12px', borderRadius: 999,
              background: '#f0fdf4', border: '1px solid #86efac',
              fontSize: 12, fontWeight: 800, color: '#16a34a',
            }}>
              100%
            </span>
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: '#e2e8f0', margin: '0 28px' }} />

        {/* ── Section 2: Expected Return detail ── */}
        <div style={{ padding: '20px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: '#fff7ed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, flexShrink: 0,
            }}>
              📈
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0d1f3d' }}>Expected Return</div>
              <div style={{ fontSize: 10.5, color: '#94a3b8' }}>Annualised estimate based on your profile</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {/* Conservative */}
            <div style={{
              flex: 1, minWidth: 140,
              padding: '14px 18px', borderRadius: 12,
              background: '#f8fafc', border: '1.5px solid #e2e8f0',
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', marginBottom: 6 }}>
                CONSERVATIVE ESTIMATE
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#0d1f3d', lineHeight: 1 }}>
                {minR}% <span style={{ fontSize: 12, color: '#94a3b8' }}>p.a.</span>
              </div>
            </div>
            {/* Optimistic */}
            <div style={{
              flex: 1, minWidth: 140,
              padding: '14px 18px', borderRadius: 12,
              background: 'linear-gradient(135deg, #0d2142, #0d1f3d)',
              border: '1.5px solid #1a3560',
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: 6 }}>
                OPTIMISTIC ESTIMATE
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#5dde8a', lineHeight: 1 }}>
                {maxR}% <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>p.a.</span>
              </div>
            </div>
            {/* Range */}
            <div style={{
              flex: 1, minWidth: 140,
              padding: '14px 18px', borderRadius: 12,
              background: '#f0fdf4', border: '1.5px solid #bbf7d0',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#16a34a', letterSpacing: '0.1em', marginBottom: 6 }}>
                ESTIMATED RANGE
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#16a34a', lineHeight: 1 }}>
                {minR}% – {maxR}%
              </div>
              <div style={{ fontSize: 10, color: '#86efac', marginTop: 4 }}>per annum, annualised</div>
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: '#e2e8f0', margin: '0 28px' }} />

        {/* ── Section 3: Investment Suggestions ── */}
        <div style={{ padding: '20px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: '#f5f3ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, flexShrink: 0,
            }}>
              💡
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0d1f3d' }}>Investment Suggestions</div>
              <div style={{ fontSize: 10.5, color: '#94a3b8' }}>2–3 recommended instruments per asset class</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {ASSET_META.map(meta => (
              <SugRow key={meta.key} meta={meta} items={sug[meta.key]} />
            ))}
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: '#e2e8f0' }} />

        {/* ── Plain-text preview panel ── */}
        <div style={{ padding: '20px 28px', background: '#f8fafc' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 10, flexWrap: 'wrap', gap: 8,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.06em' }}>
              📋 PLAIN TEXT OUTPUT — Copy this to use anywhere
            </div>
            <button
              id="btn-copy-text"
              onClick={() => copy(plainText)}
              style={{
                padding: '5px 12px', borderRadius: 6, border: '1.5px solid #e2e8f0',
                background: copied ? '#f0fdf4' : '#ffffff',
                color: copied ? '#16a34a' : '#64748b',
                fontSize: 11, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <pre style={{
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: 11.5,
            lineHeight: 1.75,
            color: '#334155',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '16px 20px',
            overflowX: 'auto',
            whiteSpace: 'pre',
            userSelect: 'all',
          }}>
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
        <div style={{ padding: '12px 28px', background: '#fffbeb', borderTop: '1px solid #fde68a' }}>
          <p style={{ fontSize: 10.5, color: '#92400e', lineHeight: 1.6 }}>
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
