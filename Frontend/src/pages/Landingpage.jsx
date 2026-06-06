import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BrainCircuit,
  ShieldCheck,
  BarChart2,
  Target,
  ArrowRight,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Zap,
  Globe,
} from 'lucide-react';

/* ─── Animated canvas background ─────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const PARTICLE_COUNT = 70;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.4,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99,102,241,${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${p.opacity})`;
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}

/* ─── Animated counter ───────────────────────────────────────── */
function Counter({ to, suffix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(to / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(timer); }
      else setVal(start);
    }, 20);
    return () => clearInterval(timer);
  }, [to]);
  return <>{val.toLocaleString()}{suffix}</>;
}

/* ─── Feature card ───────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, desc, gradient, glow, path, delay }) {
  return (
    <Link to={path} className="no-underline group" style={{ animationDelay: delay }}>
      <div
        style={{
          background: 'rgba(15,23,42,0.7)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '28px 24px',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        className="landing-card"
      >
        {/* Gradient border on hover via pseudo - we do it inline */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 20,
            background: gradient,
            opacity: 0,
            transition: 'opacity 0.35s ease',
            zIndex: 0,
          }}
          className="card-gradient-overlay"
        />

        {/* Glow blob */}
        <div
          style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: glow,
            filter: 'blur(40px)',
            opacity: 0.25,
            transition: 'opacity 0.3s ease',
          }}
        />

        {/* Icon */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 18,
            position: 'relative',
            zIndex: 1,
            boxShadow: `0 8px 24px ${glow}60`,
          }}
        >
          <Icon size={22} color="white" />
        </div>

        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#f1f5f9',
            marginBottom: 10,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: 13.5,
            color: 'rgba(148,163,184,0.85)',
            lineHeight: 1.65,
            flex: 1,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {desc}
        </p>

        <div
          style={{
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 12,
            fontWeight: 700,
            color: '#a78bfa',
            position: 'relative',
            zIndex: 1,
            opacity: 0,
            transition: 'opacity 0.25s ease',
          }}
          className="card-explore"
        >
          Explore <ChevronRight size={13} />
        </div>
      </div>
    </Link>
  );
}

const FEATURES = [
  {
    icon: BrainCircuit,
    title: 'AI Advisor',
    desc: 'Institutional-grade portfolio allocation generated by AI, validated with Zod, and tailored to your exact income and risk profile.',
    gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    glow: '#6366f1',
    path: '/signup',
  },
  {
    icon: Target,
    title: 'Finance Goals',
    desc: 'Plan for retirement, a new home, or education. See exactly when you will hit each milestone with precision.',
    gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)',
    glow: '#f59e0b',
    path: '/signup',
  },
  {
    icon: ShieldCheck,
    title: 'Risk Analysis',
    desc: 'Deep dive into asset class volatility. Compare India vs US market risks using 5-year historical data.',
    gradient: 'linear-gradient(135deg,#ec4899,#f43f5e)',
    glow: '#ec4899',
    path: '/signup',
  },
  {
    icon: BarChart2,
    title: 'Market Data',
    desc: 'Real-time tracking of top-performing stocks and commodities across global exchanges.',
    gradient: 'linear-gradient(135deg,#10b981,#059669)',
    glow: '#10b981',
    path: '/signup',
  },
];

const STATS = [
  { label: 'Active Investors', value: 12800, suffix: '+' },
  { label: 'Portfolios Analysed', value: 54000, suffix: '+' },
  { label: 'Markets Covered', value: 180, suffix: '' },
  { label: 'AI Accuracy', value: 94, suffix: '%' },
];

const TRUST_POINTS = [
  'AI-personalised portfolio allocation',
  'Zod-validated structured AI responses',
  'India & US market coverage',
  'Save and review advisory history',
];

/* ─── Ticker ─────────────────────────────────────────────────── */
const TICKER = [
  { sym: 'NIFTY 50', val: '24,832', chg: '+1.2%', up: true },
  { sym: 'S&P 500', val: '5,614', chg: '+0.8%', up: true },
  { sym: 'BTC/USD', val: '$67,420', chg: '-0.3%', up: false },
  { sym: 'GOLD', val: '$2,314', chg: '+0.5%', up: true },
  { sym: 'SENSEX', val: '81,954', chg: '+1.4%', up: true },
  { sym: 'NASDAQ', val: '19,230', chg: '+1.1%', up: true },
  { sym: 'CRUDE OIL', val: '$82.4', chg: '-0.6%', up: false },
];

export default function LandingPage() {
  return (
    <>
      {/* ── Global styles injected once ─────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .landing-root * { box-sizing: border-box; margin: 0; padding: 0; }
        .landing-root { font-family: 'Inter', sans-serif; }

        .landing-card:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
        .landing-card:hover .card-explore { opacity: 1 !important; }
        .landing-card:hover .card-gradient-overlay { opacity: 0.08 !important; }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-18px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.75; }
        }
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .anim-fade-up { animation: fade-up 0.7s ease forwards; opacity: 0; }
        .ticker-inner { animation: ticker-scroll 30s linear infinite; display: flex; gap: 0; }
        .ticker-inner:hover { animation-play-state: paused; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 30px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white; font-weight: 700; font-size: 14px;
          border: none; border-radius: 14px; cursor: pointer;
          box-shadow: 0 8px 32px rgba(99,102,241,0.45);
          transition: transform 0.2s, box-shadow 0.2s;
          text-decoration: none;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(99,102,241,0.6); }
        .btn-primary:active { transform: scale(0.97); }

        .btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 30px;
          background: rgba(255,255,255,0.06);
          color: #e2e8f0; font-weight: 700; font-size: 14px;
          border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; cursor: pointer;
          backdrop-filter: blur(12px);
          transition: transform 0.2s, background 0.2s;
          text-decoration: none;
        }
        .btn-secondary:hover { transform: translateY(-2px); background: rgba(255,255,255,0.1); }

        .shimmer-text {
          background: linear-gradient(90deg, #a78bfa, #818cf8, #60a5fa, #a78bfa);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }

        .orb {
          position: absolute; border-radius: 50%;
          filter: blur(80px); pointer-events: none;
          animation: pulse-glow 6s ease-in-out infinite;
        }

        .stat-card {
          background: rgba(15,23,42,0.6);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 20px 24px;
          text-align: center;
          backdrop-filter: blur(12px);
          transition: transform 0.3s ease;
        }
        .stat-card:hover { transform: translateY(-4px); }

        .nav-glass {
          background: rgba(7,11,31,0.8);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
        }
      `}</style>

      <div className="landing-root" style={{ minHeight: '100vh', background: '#060b18', color: '#f1f5f9', overflowX: 'hidden' }}>

        {/* ── Nav ─────────────────────────────────────────────── */}
        <nav className="nav-glass" style={{ position: 'sticky', top: 0, zIndex: 50, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#10b981,#059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(16,185,129,0.4)',
            }}>
              <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.4" viewBox="0 0 24 24">
                <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
              </svg>
            </div>
            <div>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.3px' }}>Global Wealth</span>
              <span style={{ fontSize: 10.5, color: 'rgba(148,163,184,0.5)', marginLeft: 8, fontWeight: 500 }}>AI Investment Advisor</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/login" className="no-underline">
              <button style={{
                padding: '8px 18px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, color: '#cbd5e1', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.target.style.background = 'transparent'}
              >
                Log In
              </button>
            </Link>
            <Link to="/signup" className="no-underline">
              <button style={{
                padding: '8px 18px',
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                border: 'none', borderRadius: 10, color: 'white',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 6px 24px rgba(99,102,241,0.5)'; }}
              onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 4px 16px rgba(99,102,241,0.35)'; }}
              >
                Get Started
              </button>
            </Link>
          </div>
        </nav>

        {/* ── Ticker bar ──────────────────────────────────────── */}
        <div style={{ background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.15)', overflow: 'hidden', height: 36, display: 'flex', alignItems: 'center' }}>
          <div className="ticker-inner">
            {[...TICKER, ...TICKER].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 28px', whiteSpace: 'nowrap', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', letterSpacing: '0.05em' }}>{t.sym}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#f1f5f9' }}>{t.val}</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: t.up ? '#10b981' : '#f43f5e' }}>{t.chg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section style={{ position: 'relative', padding: '100px 24px 80px', maxWidth: 1100, margin: '0 auto', textAlign: 'center', overflow: 'hidden' }}>
          {/* Particle canvas */}
          <div style={{ position: 'absolute', inset: '-100px', overflow: 'hidden' }}>
            <ParticleCanvas />
          </div>

          {/* Orbs */}
          <div className="orb" style={{ width: 500, height: 500, background: 'rgba(99,102,241,0.15)', top: -100, left: '10%' }} />
          <div className="orb" style={{ width: 400, height: 400, background: 'rgba(139,92,246,0.12)', top: 0, right: '10%', animationDelay: '2s' }} />
          <div className="orb" style={{ width: 300, height: 300, background: 'rgba(16,185,129,0.08)', bottom: 0, left: '30%', animationDelay: '4s' }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            {/* Badge */}
            <div className="anim-fade-up" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '7px 16px',
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 999, marginBottom: 28,
              fontSize: 11, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.12em', textTransform: 'uppercase',
              animationDelay: '0s',
            }}>
              <Sparkles size={11} />
              AI-Powered Wealth Management
              <Sparkles size={11} />
            </div>

            {/* Headline */}
            <h1 className="anim-fade-up" style={{
              fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              marginBottom: 24,
              animationDelay: '0.1s',
              color: '#f8fafc',
            }}>
              Invest smarter with<br />
              <span className="shimmer-text">AI-driven advice</span>
            </h1>

            {/* Sub */}
            <p className="anim-fade-up" style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'rgba(148,163,184,0.85)',
              maxWidth: 620, margin: '0 auto 40px',
              lineHeight: 1.7,
              animationDelay: '0.2s',
            }}>
              Institutional-grade portfolio allocation, risk analysis, and financial goal planning —
              powered by AI and personalised for your income, risk, and timeline.
            </p>

            {/* CTA buttons */}
            <div className="anim-fade-up" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 40, animationDelay: '0.3s' }}>
              <Link to="/signup" className="btn-primary">
                Start for Free <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="btn-secondary">
                Sign In
              </Link>
            </div>

            {/* Trust bullets */}
            <div className="anim-fade-up" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 24px', animationDelay: '0.4s' }}>
              {TRUST_POINTS.map((p) => (
                <span key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(148,163,184,0.7)', fontWeight: 500 }}>
                  <CheckCircle2 size={13} color="#10b981" />
                  {p}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats ────────────────────────────────────────────── */}
        <section style={{ padding: '0 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {STATS.map((s) => (
              <div key={s.label} className="stat-card">
                <div style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 6 }}>
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: 12, color: 'rgba(148,163,184,0.6)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Feature cards ────────────────────────────────────── */}
        <section style={{ padding: '0 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
              Platform Modules
            </p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Everything you need to invest wisely
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={`${i * 0.08}s`} />
            ))}
          </div>
        </section>

        {/* ── Dark CTA ─────────────────────────────────────────── */}
        <section style={{ padding: '0 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            position: 'relative',
            borderRadius: 28,
            background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
            padding: 'clamp(40px,8vw,72px)',
            textAlign: 'center',
            overflow: 'hidden',
            boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {/* Decorative glows */}
            <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', filter: 'blur(60px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,0.12)', filter: 'blur(60px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 20, right: 20, opacity: 0.04 }}>
              <TrendingUp size={200} />
            </div>

            {/* Spinning ring */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 500, height: 500,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              border: '1px solid rgba(99,102,241,0.12)',
              animation: 'spin-slow 20s linear infinite',
              pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                <Zap size={14} color="#fbbf24" fill="#fbbf24" />
                <p style={{ fontSize: 11, fontWeight: 700, color: '#10b981', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Ready to start?</p>
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: 16 }}>
                Your AI portfolio advisor<br />is waiting.
              </h2>
              <p style={{ color: 'rgba(148,163,184,0.7)', marginBottom: 36, maxWidth: 480, margin: '0 auto 36px', fontSize: 15, lineHeight: 1.7 }}>
                Join thousands of investors getting AI-personalised allocation advice. Free to start.
              </p>
              <Link to="/signup" className="btn-primary">
                Create Free Account <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────── */}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '20px 32px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={13} color="rgba(148,163,184,0.4)" />
            <span style={{ fontSize: 11, color: 'rgba(148,163,184,0.4)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Global Wealth Management © 2025
            </span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy Policy', 'Risk Disclosure', 'Terms'].map((l) => (
              <button
                key={l}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'rgba(148,163,184,0.4)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#94a3b8'}
                onMouseLeave={e => e.target.style.color = 'rgba(148,163,184,0.4)'}
              >
                {l}
              </button>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}
