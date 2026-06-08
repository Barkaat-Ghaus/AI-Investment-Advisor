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
    <div className="bg-[#0d2142] rounded-2xl border border-white/[0.06] p-[26px_24px] text-white flex flex-col min-w-[220px]">
      {/* Projection Summary */}
      <div className="mb-7">
        <div className="text-[14px] font-bold text-white mb-2.5">Projection Summary</div>
        <p className="text-[12px] text-white/55 leading-[1.65] mb-5">
          Based on your <strong className="text-white/85">{riskLabel} risk</strong> tolerance and{' '}
          <strong className="text-white/85">{values.duration}-year</strong> horizon, we estimate a{' '}
          <strong className="text-[#5dde8a]">{annualReturn}% annual yield.</strong>
        </p>

        <div className="font-inter text-[38px] font-extrabold text-white leading-none mb-1.5 tracking-[-0.02em]">
          {formatWealth(displayWealth)}
        </div>
        <div className="text-[10px] font-semibold tracking-[0.1em] text-white/40">
          ESTIMATED WEALTH AT MATURITY
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/[0.07] mb-5" />

      {/* Advisor Analysis */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          {/* Green check icon */}
          <div className="w-[22px] h-[22px] rounded-full bg-[rgba(61,158,95,0.25)] border-[1.5px] border-[#3d9e5f] flex items-center justify-center shrink-0">
            <svg width="11" height="11" fill="none" stroke="#5dde8a" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className="text-[13px] font-bold text-white">Advisor Analysis</span>
        </div>
        <p className="text-[12px] text-white/50 leading-[1.7] italic">
          {quote}
        </p>
      </div>
    </div>
  );
}
