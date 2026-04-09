import React, { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';

/* ══════════════════════════════════════════════════════════════
   CONFIG
══════════════════════════════════════════════════════════════ */
// Single accent: navy. All states use the same hue at different opacities.
const C = {
  navy:       '#0d1f3d',
  navyLight:  '#1a3560',
  slate50:    '#f8fafc',
  slate100:   '#f1f5f9',
  slate200:   '#e2e8f0',
  slate300:   '#cbd5e1',
  slate400:   '#94a3b8',
  slate600:   '#475569',
  slate700:   '#334155',
  slate900:   '#0f172a',
  white:      '#ffffff',
  error:      '#ef4444',
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
   GROWTH CHART — muted blue-slate palette
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

    // Horizontal grid lines — very subtle
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    [0.33, 0.66, 1].forEach(f => {
      const y = PAD.top + f * plotH;
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke();
    });

    // Area fill — muted slate-blue gradient (no green)
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

    // Line — crisp white
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.8;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(toX(p.x), toY(p.y)) : ctx.lineTo(toX(p.x), toY(p.y)));
    ctx.stroke();

    // Key dots
    [0, Math.round(dur / 2), dur].forEach(i => {
      const p = pts[i];
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath(); ctx.arc(toX(p.x), toY(p.y), 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.navy;
      ctx.beginPath(); ctx.arc(toX(p.x), toY(p.y), 1.4, 0, Math.PI * 2); ctx.fill();
    });

    // Y labels
    ctx.font = '9px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.textAlign = 'right';
    const fmtY = v => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v / 1000).toFixed(0)}K`;
    [[minY, plotH], [(minY + maxY) / 2, plotH * 0.5], [maxY, 0]].forEach(([v, f]) => {
      ctx.fillText(fmtY(v), PAD.left - 4, PAD.top + f + 3.5);
    });

    // X labels
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.textAlign = 'center';
    [0, Math.round(dur / 2), dur].forEach(xi => ctx.fillText(`${xi}`, toX(xi), H - 7));
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.textAlign = 'right';
    ctx.fillText('yrs', W - 2, H - 7);

  }, [duration, risk]);

  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />;
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
    <div style={{ position: 'relative' }}>
      {/* Floating label */}
      <label htmlFor={id} style={{
        position: 'absolute', pointerEvents: 'none', zIndex: 2, left: 40,
        transition: 'all 0.15s ease',
        ...(lifted
          ? { top: 8, fontSize: 10, fontWeight: 600, color: focused ? C.navy : C.slate400, letterSpacing: '0.04em', background: C.white, padding: '0 2px' }
          : { top: '50%', transform: 'translateY(-50%)', fontSize: 13.5, fontWeight: 500, color: C.slate400 }),
      }}>
        {label}
      </label>

      <div style={{
        display: 'flex', alignItems: 'center', height: 56,
        borderRadius: 10,
        border: `1.5px solid ${error ? C.error : focused ? C.navy : C.slate200}`,
        background: C.white,
        boxShadow: focused ? `0 0 0 3px rgba(13,31,61,0.06)` : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        overflow: 'hidden',
      }}>
        <span style={{
          paddingLeft: 14, paddingRight: 2, fontSize: 14, fontWeight: 700,
          color: focused ? C.navy : C.slate400,
          flexShrink: 0, userSelect: 'none', transition: 'color 0.15s',
          alignSelf: 'flex-end', paddingBottom: 10,
        }}>₹</span>
        <input
          id={id} type="text" inputMode="numeric"
          ref={field.ref} name={field.name}
          value={displayVal} onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); field.onBlur?.(); }}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontSize: 15, fontWeight: 700, color: C.navy, fontFamily: 'inherit',
            paddingBottom: 8, paddingTop: 18, paddingRight: 14,
          }}
        />
      </div>

      {error && (
        <p style={{ marginTop: 4, fontSize: 11, color: C.error, fontWeight: 500, paddingLeft: 2 }}>
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
  const bg  = `linear-gradient(to right,${C.navy} 0%,${C.navy} ${pct}%,${C.slate200} ${pct}%,${C.slate200} 100%)`;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: C.slate400, letterSpacing: '0.1em' }}>
          INVESTMENT DURATION
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: C.navy, lineHeight: 1 }}>{value}</span>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: C.slate400 }}>yrs</span>
        </div>
      </div>
      <input
        type="range" min="1" max="40" value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="range-slider"
        style={{ background: bg, width: '100%' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7 }}>
        {MARKS.map((m, i) => (
          <span key={i} style={{ fontSize: 9.5, color: C.slate300, fontWeight: 400 }}>{m}</span>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   RISK SELECTOR — monochromatic, no color-coding
══════════════════════════════════════════════════════════════ */
function RiskSelector({ field }) {
  const { value, onChange } = field;
  const active = RISK_OPTIONS.find(o => o.value === value);

  return (
    <div>
      <p style={{ fontSize: 10.5, fontWeight: 700, color: C.slate400, letterSpacing: '0.1em', marginBottom: 10 }}>
        RISK TOLERANCE
      </p>

      <div style={{ display: 'flex', gap: 8 }}>
        {RISK_OPTIONS.map(opt => {
          const on = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              style={{
                flex: 1,
                padding: '9px 0',
                borderRadius: 9,
                border: `1.5px solid ${on ? C.navy : C.slate200}`,
                background: on ? C.navy : C.white,
                color: on ? C.white : C.slate600,
                fontSize: 13,
                fontWeight: on ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: on ? '0 2px 10px rgba(13,31,61,0.18)' : 'none',
                transform: on ? 'translateY(-1px)' : 'none',
                position: 'relative',
              }}
            >
              {opt.label}
              {/* Active indicator dot below the label */}
              {on && (
                <span style={{
                  position: 'absolute', bottom: -1, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 4, height: 4, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.6)',
                }}/>
              )}
            </button>
          );
        })}
      </div>

      {/* Description — neutral, no colored background */}
      {active && (
        <div style={{
          marginTop: 8,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 12px',
          borderRadius: 8,
          background: C.slate50,
          border: `1px solid ${C.slate200}`,
          fontSize: 12,
          fontWeight: 500,
          color: C.slate600,
        }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
            color: C.white, background: C.navy,
            padding: '2px 7px', borderRadius: 4,
            flexShrink: 0,
          }}>
            {active.badge.toUpperCase()}
          </span>
          {active.desc}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   GOAL LIST — clean navy active state
══════════════════════════════════════════════════════════════ */
function GoalList({ field }) {
  const { value, onChange } = field;

  return (
    <div>
      <p style={{ fontSize: 10.5, fontWeight: 700, color: C.slate400, letterSpacing: '0.1em', marginBottom: 10 }}>
        FINANCIAL GOAL
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {GOAL_OPTIONS.map(opt => {
          const on = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 11px',
                borderRadius: 9,
                border: `1.5px solid ${on ? C.navy : C.slate200}`,
                background: on ? C.navy : C.white,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: on ? '0 2px 10px rgba(13,31,61,0.14)' : 'none',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Monochrome icon placeholder instead of emoji when active */}
                <span style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: on ? 'rgba(255,255,255,0.12)' : C.slate100,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, flexShrink: 0,
                }}>
                  {opt.icon}
                </span>
                <span style={{
                  fontSize: 12.5,
                  fontWeight: on ? 600 : 500,
                  color: on ? C.white : C.slate700,
                }}>
                  {opt.label}
                </span>
              </div>
              <span style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: on ? 'rgba(255,255,255,0.8)' : C.slate400,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.01em',
              }}>
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
      style={{
        background: C.white,
        borderRadius: 16,
        border: `1px solid ${C.slate200}`,
        boxShadow: '0 1px 8px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
    >
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '15px 22px',
        borderBottom: `1px solid ${C.slate100}`,
        background: C.white,
      }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: C.navy }}>
          Investment Profile Input
        </span>
        {/* Progress indicator — slate only */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: C.slate300, letterSpacing: '0.04em' }}>⏱ 6-9D</span>
          <div style={{ display: 'flex', gap: 3 }}>
            {[1, 1, 1, 0, 0].map((on, i) => (
              <div key={i} style={{
                width: 18, height: 4, borderRadius: 3,
                background: on ? C.navy : C.slate200,
                opacity: on ? (i === 0 ? 1 : i === 1 ? 0.65 : 0.35) : 1,
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Row 1: Income / Investment */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Controller name="income" control={control}
            rules={{ required: 'Required', min: { value: 1, message: 'Must be > 0' } }}
            render={({ field }) => <MoneyInput id="income" label="Monthly Income" field={field} error={errors.income} />}
          />
          <Controller name="investment" control={control}
            rules={{ required: 'Required', min: { value: 100, message: 'Min ₹100' } }}
            render={({ field }) => <MoneyInput id="investment" label="Investment Amount" field={field} error={errors.investment} />}
          />
        </div>

        {/* Row 2: Duration */}
        <div style={{
          padding: '13px 15px',
          borderRadius: 10,
          border: `1.5px solid ${C.slate200}`,
          background: C.slate50,
        }}>
          <Controller name="duration" control={control}
            render={({ field }) => <DurationSlider field={field} />}
          />
        </div>

        {/* Row 3: Risk */}
        <Controller name="risk" control={control}
          render={({ field }) => <RiskSelector field={field} />}
        />

        {/* Row 4: Goals + Chart */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

          <Controller name="goal" control={control}
            render={({ field }) => <GoalList field={field} />}
          />

          {/* Growth chart — dark card */}
          <div style={{
            background: C.navy,
            borderRadius: 12,
            padding: '12px 13px',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 240,
          }}>
            {/* Chart header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,0.82)', letterSpacing: '0.01em' }}>
                Growth Projection
              </span>
              <span style={{
                fontSize: 9.5, fontWeight: 600,
                color: 'rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.08)',
                padding: '2px 7px', borderRadius: 5,
              }}>
                {dur} yr ▾
              </span>
            </div>

            {/* Canvas */}
            <div style={{ flex: 1, minHeight: 0 }}>
              <GrowthChart duration={dur} risk={risk} />
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              marginTop: 8, paddingTop: 8,
              borderTop: '1px solid rgba(255,255,255,0.07)',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'rgba(255,255,255,0.5)', flexShrink: 0,
              }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.02em' }}>
                Expected annual return
              </span>
              <span style={{
                fontSize: 11.5, fontWeight: 800,
                color: 'rgba(255,255,255,0.78)',
                marginLeft: 'auto',
                letterSpacing: '-0.01em',
              }}>
                {RETURN_RANGE[risk]}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: C.slate100, marginTop: 2 }} />

        {/* Submit — solid navy, no green */}
        <button
          id="btn-analyze-portfolio"
          type="submit"
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '13px 24px',
            borderRadius: 10,
            background: C.navy,
            color: C.white,
            fontSize: 13.5,
            fontWeight: 700,
            letterSpacing: '0.025em',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = C.navyLight;
            e.currentTarget.style.transform  = 'translateY(-1px)';
            e.currentTarget.style.boxShadow  = '0 6px 20px rgba(13,31,61,0.28)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = C.navy;
            e.currentTarget.style.transform  = 'none';
            e.currentTarget.style.boxShadow  = 'none';
          }}
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
