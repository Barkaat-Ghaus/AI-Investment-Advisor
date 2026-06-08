import React, { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';

/* ══════════════════════════════════════════════════════════════
   CONFIG — kept only for canvas drawing (cannot use Tailwind in canvas ctx)
══════════════════════════════════════════════════════════════ */
const C = {
  navy:      '#0d1f3d',
  navyLight: '#1a3560',
  slate200:  '#e2e8f0',
  slate400:  '#94a3b8',
  white:     '#ffffff',
  error:     '#ef4444',
};

const RISK_OPTIONS = [
  { value: 'low',    label: 'Low',    badge: 'Conservative', desc: 'Capital preservation — stable returns, low volatility.' },
  { value: 'medium', label: 'Medium', badge: 'Balanced',     desc: 'Moderate risk with diversified asset exposure.' },
  { value: 'high',   label: 'High',   badge: 'Aggressive',   desc: 'High equity tilt — maximum long-term return potential.' },
];

const GOAL_OPTIONS = [
  { value: 'retirement',     label: 'Retirement',     icon: '🏖️', amt: 20000 },
  { value: 'wealth_growth',  label: 'Wealth Growth',  icon: '📈', amt: 25000 },
  { value: 'education',      label: 'Education',      icon: '🎓', amt: 20000 },
  { value: 'house_purchase', label: 'House Purchase', icon: '🏠', amt: 5000  },
];

const MARKS = [1, 5, 10, 15, 20, 35, '40+'];

const RETURN_RANGE = { low: '5%–7.5%', medium: '8%–12%', high: '10%–15%' };

function fmt(n) {
  return Number(n).toLocaleString('en-IN');
}

/* ══════════════════════════════════════════════════════════════
   GROWTH CHART — canvas-based, C values used for ctx drawing
══════════════════════════════════════════════════════════════ */
function GrowthChart({ duration, risk }) {
  const ref  = useRef(null);
  const mult = { low: 1.062, medium: 1.074, high: 1.101 }[risk] ?? 1.074;
  const BASE = 200000;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth  || 320;
    const H = canvas.offsetHeight || 120;
    canvas.width  = W;
    canvas.height = H;
    const PAD = { top: 10, right: 8, bottom: 26, left: 48 };

    const dur   = Math.max(1, Number(duration));
    const pts   = Array.from({ length: dur + 1 }, (_, i) => ({ x: i, y: Math.round(BASE * Math.pow(mult, i)) }));
    const maxY  = pts[pts.length - 1].y;
    const minY  = BASE * 0.92;
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top  - PAD.bottom;

    const toX = xi => PAD.left + (xi / dur) * plotW;
    const toY = yi => PAD.top  + (1 - (yi - minY) / (maxY - minY)) * plotH;

    ctx.clearRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    [0.33, 0.66, 1].forEach(f => {
      const y = PAD.top + f * plotH;
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke();
    });

    const grad = ctx.createLinearGradient(0, PAD.top, 0, H - PAD.bottom);
    grad.addColorStop(0, 'rgba(148,163,184,0.28)');
    grad.addColorStop(1, 'rgba(148,163,184,0.02)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(toX(0), H - PAD.bottom);
    pts.forEach(p => ctx.lineTo(toX(p.x), toY(p.y)));
    ctx.lineTo(toX(dur), H - PAD.bottom);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.8;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(toX(p.x), toY(p.y)) : ctx.lineTo(toX(p.x), toY(p.y)));
    ctx.stroke();

    [0, Math.round(dur / 2), dur].forEach(i => {
      const p = pts[i];
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath(); ctx.arc(toX(p.x), toY(p.y), 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.navy;
      ctx.beginPath(); ctx.arc(toX(p.x), toY(p.y), 1.4, 0, Math.PI * 2); ctx.fill();
    });

    ctx.font = '9px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.textAlign = 'right';
    const fmtY = v => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v / 1000).toFixed(0)}K`;
    [[minY, plotH], [(minY + maxY) / 2, plotH * 0.5], [maxY, 0]].forEach(([v, f]) => {
      ctx.fillText(fmtY(v), PAD.left - 4, PAD.top + f + 3.5);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.textAlign = 'center';
    [0, Math.round(dur / 2), dur].forEach(xi => ctx.fillText(`${xi}`, toX(xi), H - 7));
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.textAlign = 'right';
    ctx.fillText('yrs', W - 2, H - 7);

  }, [duration, risk]);

  return <canvas ref={ref} className="w-full h-full block" />;
}

/* ══════════════════════════════════════════════════════════════
   MONEY INPUT — floating label, comma display
══════════════════════════════════════════════════════════════ */
function MoneyInput({ id, label, field, error }) {
  const [focused, setFocused] = useState(false);
  const rawNum     = Number(field.value) || '';
  const displayVal = focused
    ? (field.value === 0 || field.value === '' ? '' : String(field.value))
    : (rawNum ? rawNum.toLocaleString('en-IN') : '');
  const hasVal = !!rawNum;
  const lifted = focused || hasVal;

  const handleChange = e => {
    const raw = e.target.value.replace(/,/g, '');
    const num = raw === '' ? '' : Number(raw);
    field.onChange(isNaN(num) ? '' : num);
  };

  return (
    <div className="relative">
      {/* Floating label */}
      <label
        htmlFor={id}
        className={`absolute pointer-events-none z-[2] left-10 transition-all duration-150 ease-in-out ${
          lifted
            ? `top-2 text-[10px] font-semibold tracking-[0.04em] bg-white px-0.5 ${focused ? 'text-[#0d1f3d]' : 'text-slate-400'}`
            : 'top-1/2 -translate-y-1/2 text-[13.5px] font-medium text-slate-400'
        }`}
      >
        {label}
      </label>

      <div className={`flex items-center h-14 rounded-[10px] bg-white overflow-hidden transition-all duration-150
        border-[1.5px] ${error ? 'border-red-400' : focused ? 'border-[#0d1f3d] shadow-[0_0_0_3px_rgba(13,31,61,0.06)]' : 'border-slate-200'}`}
      >
        <span className={`pl-3.5 pr-0.5 text-sm font-bold flex-shrink-0 select-none self-end pb-2.5 transition-colors duration-150
          ${focused ? 'text-[#0d1f3d]' : 'text-slate-400'}`}>
          ₹
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          ref={field.ref}
          name={field.name}
          value={displayVal}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); field.onBlur?.(); }}
          className="flex-1 bg-transparent border-none outline-none text-[15px] font-bold text-[#0d1f3d] font-inherit pb-2 pt-[18px] pr-3.5"
        />
      </div>

      {error && (
        <p className="mt-1 text-[11px] text-red-400 font-medium pl-0.5">
          {error.message}
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DURATION SLIDER — single navy/slate track
══════════════════════════════════════════════════════════════ */
function DurationSlider({ field }) {
  const { value, onChange } = field;
  const pct = ((value - 1) / 39) * 100;
  // Track gradient must stay inline — uses a JS-computed pct variable
  const bg  = `linear-gradient(to right,${C.navy} 0%,${C.navy} ${pct}%,${C.slate200} ${pct}%,${C.slate200} 100%)`;

  return (
    <div>
      <div className="flex justify-between items-baseline mb-3">
        <span className="text-[10.5px] font-bold text-slate-400 tracking-[0.1em]">
          INVESTMENT DURATION
        </span>
        <div className="flex items-baseline gap-[3px]">
          <span className="text-[22px] font-extrabold text-[#0d1f3d] leading-none">{value}</span>
          <span className="text-[11.5px] font-semibold text-slate-400">yrs</span>
        </div>
      </div>
      <input
        type="range"
        min="1"
        max="40"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="range-slider w-full"
        style={{ background: bg }}
      />
      <div className="flex justify-between mt-[7px]">
        {MARKS.map((m, i) => (
          <span key={i} className="text-[9.5px] text-slate-300 font-normal">{m}</span>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   RISK SELECTOR
══════════════════════════════════════════════════════════════ */
function RiskSelector({ field }) {
  const { value, onChange } = field;
  const active = RISK_OPTIONS.find(o => o.value === value);

  return (
    <div>
      <p className="text-[10.5px] font-bold text-slate-400 tracking-[0.1em] mb-2.5">
        RISK TOLERANCE
      </p>

      <div className="flex gap-2">
        {RISK_OPTIONS.map(opt => {
          const on = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex-1 py-[9px] rounded-[9px] text-[13px] cursor-pointer transition-all duration-150 relative
                border-[1.5px] ${on
                  ? 'bg-[#0d1f3d] border-[#0d1f3d] text-white font-bold shadow-[0_2px_10px_rgba(13,31,61,0.18)] -translate-y-px'
                  : 'bg-white border-slate-200 text-slate-600 font-medium'
                }`}
            >
              {opt.label}
              {on && (
                <span className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/60" />
              )}
            </button>
          );
        })}
      </div>

      {active && (
        <div className="mt-2 flex items-center gap-2 px-3 py-[9px] rounded-lg bg-slate-50 border border-slate-200 text-[12px] font-medium text-slate-600">
          <span className="text-[10px] font-bold tracking-[0.05em] text-white bg-[#0d1f3d] px-[7px] py-[2px] rounded shrink-0">
            {active.badge.toUpperCase()}
          </span>
          {active.desc}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   GOAL LIST
══════════════════════════════════════════════════════════════ */
function GoalList({ field }) {
  const { value, onChange } = field;

  return (
    <div>
      <p className="text-[10.5px] font-bold text-slate-400 tracking-[0.1em] mb-2.5">
        FINANCIAL GOAL
      </p>
      <div className="flex flex-col gap-[5px]">
        {GOAL_OPTIONS.map(opt => {
          const on = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex items-center justify-between px-[11px] py-2 rounded-[9px] cursor-pointer transition-all duration-150 w-full text-left
                border-[1.5px] ${on
                  ? 'bg-[#0d1f3d] border-[#0d1f3d] shadow-[0_2px_10px_rgba(13,31,61,0.14)]'
                  : 'bg-white border-slate-200'
                }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-[7px] flex items-center justify-center text-[13px] shrink-0
                  ${on ? 'bg-white/[0.12]' : 'bg-slate-100'}`}>
                  {opt.icon}
                </span>
                <span className={`text-[12.5px] ${on ? 'font-semibold text-white' : 'font-medium text-slate-700'}`}>
                  {opt.label}
                </span>
              </div>
              <span className={`text-[12.5px] font-bold tabular-nums tracking-[-0.01em]
                ${on ? 'text-white/80' : 'text-slate-400'}`}>
                ₹{fmt(opt.amt)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN FORM
══════════════════════════════════════════════════════════════ */
export default function InvestmentForm({ values: ext, onChange, onCalculate }) {
  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      income:     ext?.income     ?? 60000,
      investment: ext?.investment ?? 20000,
      duration:   ext?.duration   ?? 10,
      risk:       ext?.risk       ?? 'medium',
      goal:       ext?.goal       ?? 'wealth_growth',
    },
    mode: 'onChange',
  });

  const dur  = watch('duration');
  const risk = watch('risk');

  useEffect(() => {
    const sub = watch(vals => Object.entries(vals).forEach(([k, v]) => onChange(k, v)));
    return () => sub.unsubscribe();
  }, [watch, onChange]);

  return (
    <form
      onSubmit={handleSubmit(() => onCalculate())}
      noValidate
      className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_8px_rgba(0,0,0,0.05),0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-[22px] py-[15px] border-b border-slate-100 bg-white">
        <span className="text-[13.5px] font-bold text-[#0d1f3d]">
          Investment Profile Input
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-slate-300 tracking-[0.04em]">⏱ 6-9D</span>
          <div className="flex gap-[3px]">
            {[1, 1, 1, 0, 0].map((on, i) => (
              <div
                key={i}
                className="w-[18px] h-1 rounded-[3px]"
                style={{
                  background: on ? C.navy : C.slate200,
                  opacity: on ? (i === 0 ? 1 : i === 1 ? 0.65 : 0.35) : 1,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-[22px] py-5 flex flex-col gap-[18px]">

        {/* Row 1: Income / Investment */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          <Controller
            name="income"
            control={control}
            rules={{ required: 'Required', min: { value: 1, message: 'Must be > 0' } }}
            render={({ field }) => <MoneyInput id="income" label="Monthly Income" field={field} error={errors.income} />}
          />
          <Controller
            name="investment"
            control={control}
            rules={{ required: 'Required', min: { value: 100, message: 'Min ₹100' } }}
            render={({ field }) => <MoneyInput id="investment" label="Monthly Investment Amount" field={field} error={errors.investment} />}
          />
        </div>

        {/* Row 2: Duration */}
        <div className="px-[15px] py-[13px] rounded-[10px] border-[1.5px] border-slate-200 bg-slate-50">
          <Controller
            name="duration"
            control={control}
            render={({ field }) => <DurationSlider field={field} />}
          />
        </div>

        {/* Row 3: Risk */}
        <Controller
          name="risk"
          control={control}
          render={({ field }) => <RiskSelector field={field} />}
        />

        {/* Row 4: Goals + Chart */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3">
          <Controller
            name="goal"
            control={control}
            render={({ field }) => <GoalList field={field} />}
          />

          {/* Growth chart — dark card */}
          <div className="bg-[#0d1f3d] rounded-xl p-[12px_13px] flex flex-col min-h-[240px]">
            {/* Chart header */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11.5px] font-bold text-white/[0.82] tracking-[0.01em]">
                Growth Projection
              </span>
              <span className="text-[9.5px] font-semibold text-white/40 bg-white/[0.08] px-[7px] py-[2px] rounded-[5px]">
                {dur} yr ▾
              </span>
            </div>

            {/* Canvas */}
            <div className="flex-1 min-h-0">
              <GrowthChart duration={dur} risk={risk} />
            </div>

            {/* Footer */}
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/[0.07]">
              <div className="w-1.5 h-1.5 rounded-full bg-white/50 shrink-0" />
              <span className="text-[10px] text-white/[0.38] tracking-[0.02em]">
                Expected annual return
              </span>
              <span className="text-[11.5px] font-extrabold text-white/[0.78] ml-auto tracking-[-0.01em]">
                {RETURN_RANGE[risk]}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 mt-0.5" />

        {/* Submit */}
        <button
          id="btn-analyze-portfolio"
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-6 py-[13px] rounded-[10px]
            bg-[#0d1f3d] text-white text-[13.5px] font-bold tracking-[0.025em] border-none cursor-pointer
            transition-all duration-150 hover:bg-[#1a3560] hover:-translate-y-px
            hover:shadow-[0_6px_20px_rgba(13,31,61,0.28)]"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          Analyze &amp; Generate Portfolio
        </button>
      </div>
    </form>
  );
}
