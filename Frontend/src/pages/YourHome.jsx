import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/store';
import useFinancialRiskDataStore from '../store/financialRiskDataStore';
import {
  BrainCircuit,
  TrendingUp,
  ShieldCheck,
  BarChart2,
  Target,
  History,
  ArrowRight,
  Sparkles,
  Wallet,
  Clock,
  ChevronRight,
  User,
  Activity,
  Zap,
} from 'lucide-react';

/* ─── Premium Quick-Action Card ─────────────────────────────── */
function ActionCard({ icon: Icon, label, sub, path, gradient, glowColor }) {
  return (
    <Link to={path} className="no-underline group">
      <div 
        className="relative bg-white rounded-2xl border border-slate-100 p-5 shadow-sm
          hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
      >
        {/* Glow effect on hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at top right, ${glowColor}15, transparent 70%)`
          }}
        />

        {/* Icon wrapper with custom gradient */}
        <div 
          className="inline-flex w-11 h-11 rounded-xl items-center justify-center mb-4 text-white shadow-md transition-transform duration-300 group-hover:scale-110"
          style={{ background: gradient }}
        >
          <Icon size={18} />
        </div>

        <h3 className="text-[13.5px] font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
          {label}
        </h3>
        <p className="text-[11.5px] text-slate-400 leading-relaxed flex-1">{sub}</p>

        <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-300">
          Open module <ChevronRight size={11} />
        </div>
      </div>
    </Link>
  );
}

/* ─── Premium Stat Card ─────────────────────────────────────── */
function StatCard({ label, value, sub, icon: Icon, gradient, textColor }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-start gap-4">
      <div 
        className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-white shadow-sm"
        style={{ background: gradient }}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-2xl font-extrabold leading-none ${textColor}`}>{value}</p>
        {sub && <p className="text-[11.5px] text-slate-400 mt-1.5 font-medium flex items-center gap-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function YourHome() {
  const { user }        = useAuthStore();
  const { region }      = useFinancialRiskDataStore();

  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'Investor';

  const QUICK_ACTIONS = [
    {
      icon: BrainCircuit,
      label: 'AI Advisor',
      sub: 'Get a personalised asset allocation recommendation.',
      path: '/advisor',
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      glowColor: '#6366f1',
    },
    {
      icon: ShieldCheck,
      label: 'Risk Analysis',
      sub: 'Explore and compare asset class risk & volatility.',
      path: '/risk-analysis',
      gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
      glowColor: '#ec4899',
    },
    {
      icon: BarChart2,
      label: 'Market Data',
      sub: 'Track top stock & commodity exchange metrics.',
      path: '/markets',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      glowColor: '#10b981',
    },
    {
      icon: Target,
      label: 'Finance Goals',
      sub: 'Define, adjust, and achieve your financial targets.',
      path: '/goals',
      gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
      glowColor: '#f59e0b',
    },
    {
      icon: History,
      label: 'Advisory History',
      sub: 'Review your previously saved portfolio reports.',
      path: '/advisory-history',
      gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      glowColor: '#3b82f6',
    },
    {
      icon: User,
      label: 'My Profile',
      sub: 'View & modify your system income & risk setup.',
      path: '/profile',
      gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)',
      glowColor: '#14b8a6',
    },
  ];

  return (
    <main className="px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8 pb-16 max-w-7xl mx-auto">
      
      {/* ── Injection of Subtle Animations ─────────────────────── */}
      <style>{`
        @keyframes float-subtle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        .animate-float-subtle {
          animation: float-subtle 4s ease-in-out infinite;
        }
      `}</style>

      {/* ── Hero Banner ──────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden mb-8
        bg-gradient-to-br from-[#0b1329] via-[#0d1f3d] to-[#112d52]
        p-8 sm:p-10 shadow-xl shadow-[#0d1f3d]/20 border border-white/[0.04]">
        
        {/* Glow Spheres */}
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1
                rounded-full bg-emerald-400/15 text-emerald-400 border border-emerald-400/20 uppercase tracking-wider">
                <Sparkles size={10} className="text-emerald-400 animate-pulse" /> AI-Powered Advisory
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
              {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">{firstName}</span> 👋
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Welcome back to your financial command center. Harness advanced analytics and customized portfolio models to guide your wealth.
            </p>
          </div>

          <Link to="/advisor" className="no-underline shrink-0">
            <button className="flex items-center gap-2.5 px-6 py-4 bg-white text-[#0d1f3d]
              rounded-2xl font-bold text-[14px] shadow-lg hover:shadow-xl hover:bg-slate-50
              hover:-translate-y-0.5 transition-all duration-200 active:scale-95">
              <BrainCircuit size={16} className="text-indigo-600" />
              Open AI Advisor
              <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </Link>
        </div>
      </div>

      {/* ── Stats Row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Region Focus"
          value={region === 'india' ? 'India' : 'United States'}
          sub={<><span className="text-emerald-500 font-bold">●</span> Active market insights</>}
          icon={TrendingUp}
          gradient="linear-gradient(135deg, #818cf8, #4f46e5)"
          textColor="text-slate-800"
        />
        <StatCard
          label="AI Engine Modules"
          value="5 Active"
          sub="Institutional grade validation"
          icon={Sparkles}
          gradient="linear-gradient(135deg, #a78bfa, #7c3aed)"
          textColor="text-slate-800"
        />
        <StatCard
          label="Diversification"
          value="5 Classes"
          sub="Stocks · Bonds · Gold · MF · Cash"
          icon={Wallet}
          gradient="linear-gradient(135deg, #34d399, #059669)"
          textColor="text-slate-800"
        />
        <StatCard
          label="Adviser Session"
          value="Secure"
          sub="Zod-validated schema"
          icon={Clock}
          gradient="linear-gradient(135deg, #fbbf24, #d97706)"
          textColor="text-slate-800"
        />
      </div>

      {/* ── Quick Actions Grid ───────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.15em]">
            Interactive Modules
          </h2>
          <span className="h-px bg-slate-100 flex-1 ml-4" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {QUICK_ACTIONS.map((a) => (
            <ActionCard key={a.path} {...a} />
          ))}
        </div>
      </div>

      {/* ── Premium Bottom Section / Info Banner ────────────────────────────── */}
      <div className="relative rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900
        p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-950/20 shadow-md">
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <Activity size={22} className="animate-pulse" />
          </div>
          <div>
            <p className="text-white font-bold text-base mb-0.5">
              Ready to generate your personalized wealth roadmap?
            </p>
            <p className="text-indigo-200 text-xs sm:text-[13px] leading-normal">
              Enter your income metrics, financial timeline, and risk tolerance to obtain optimized targets.
            </p>
          </div>
        </div>
        
        <Link to="/advisor" className="no-underline shrink-0">
          <button className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white
            rounded-xl font-bold text-sm hover:opacity-95 transition-all
            hover:-translate-y-0.5 active:scale-95 shadow-md shadow-emerald-950/25">
            <Zap size={14} fill="currentColor" />
            Get Started
            <ArrowRight size={14} />
          </button>
        </Link>
      </div>

    </main>
  );
}
