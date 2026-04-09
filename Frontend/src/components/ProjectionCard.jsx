import React, { useState, useEffect } from 'react';

function useCountUp(target, duration = 1000, active = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, active]);
  return value;
}

function formatWealth(value) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

const ADVISOR_QUOTES = {
  low:    '"Conservative allocation with steady bonds and gold exposure keeps your capital protected through market volatility."',
  medium: '"Your current diversification looks healthy, but consider increasing tech exposure to hedge against inflation."',
  high:   '"Aggressive equity tilt is well-suited for your horizon. Consider mid-cap growth funds for alpha generation."',
};

export default function ProjectionCard({ projection, values, calculated }) {
  const { risk, duration, annualReturn, projectedWealth } = projection;
  const animatedWealth = useCountUp(projectedWealth, 1200, calculated);
  const displayWealth = calculated ? animatedWealth : projectedWealth;
  const quote = ADVISOR_QUOTES[values.risk] || ADVISOR_QUOTES.medium;
  const riskLabel = values.risk ? values.risk.charAt(0).toUpperCase() + values.risk.slice(1) : 'Medium';

  return (
    <div style={{
      background: '#0d2142',
      borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.06)',
      padding: '26px 24px',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      minWidth: 220,
    }}>
      {/* Projection Summary */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginBottom: 10 }}>
          Projection Summary
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, marginBottom: 20 }}>
          Based on your <strong style={{ color: 'rgba(255,255,255,0.85)' }}>{riskLabel} risk</strong> tolerance and{' '}
          <strong style={{ color: 'rgba(255,255,255,0.85)' }}>{values.duration}-year</strong> horizon, we estimate a{' '}
          <strong style={{ color: '#5dde8a' }}>{annualReturn}% annual yield.</strong>
        </p>

        <div style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 38,
          fontWeight: 800,
          color: '#ffffff',
          lineHeight: 1,
          marginBottom: 6,
          letterSpacing: '-0.02em',
        }}>
          {formatWealth(displayWealth)}
        </div>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>
          ESTIMATED WEALTH AT MATURITY
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 20 }} />

      {/* Advisor Analysis */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          {/* Green check icon */}
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: 'rgba(61,158,95,0.25)', border: '1.5px solid #3d9e5f',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="11" height="11" fill="none" stroke="#5dde8a" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Advisor Analysis</span>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, fontStyle: 'italic' }}>
          {quote}
        </p>
      </div>
    </div>
  );
}
