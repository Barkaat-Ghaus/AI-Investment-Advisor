import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/store';
import { 
  Sparkles, 
  Home, 
  Zap, 
  Target, 
  BarChart3, 
  TrendingUp,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

/* ── Home Hub Card ─────────────────────────────────────────────── */
function HubCard({ title, desc, icon: Icon, path, color }) {
  return (
    <Link to={path} className="group no-underline block">
      <div className="w-full bg-white rounded-4xl border border-slate-100 p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-indigo-100 flex flex-col md:flex-row items-center md:items-center gap-6 lg:gap-10">
        <div className={`w-20 h-20 shrink-0 rounded-3xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className="w-10 h-10" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{title}</h3>
          <p className="text-base text-slate-500 leading-relaxed max-w-2xl">{desc}</p>
        </div>
        <div className="shrink-0 flex items-center gap-3 bg-slate-50 px-6 py-4 rounded-2xl text-indigo-600 font-black text-xs uppercase tracking-[0.1em] group-hover:bg-indigo-600 group-hover:text-white transition-all">
          Explore Module <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}

export default function YourHome() {
  const { user } = useAuthStore();

  const HUB_ITEMS = [
    {
      title: "AI Advisor",
      desc: "Receive institutional-grade investment strategies tailored to your income, savings, and risk appetite.",
      icon: Zap,
      path: "/advisor",
      color: "bg-amber-100 text-amber-600"
    },
    {
      title: "Finance Goals",
      desc: "Plan for retirement, a new home, or child education. See exactly when you'll hit your targets.",
      icon: Target,
      path: "/goals",
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      title: "Risk Analysis",
      desc: "Deep dive into asset class volatility. Compare India vs US market risks using 5-year historical data.",
      icon: ShieldCheck,
      path: "/risk-analysis",
      color: "bg-rose-100 text-rose-600"
    },
    {
      title: "Market Data",
      desc: "Real-time tracking of top-performing stocks and commodities across global exchanges.",
      icon: BarChart3,
      path: "/markets",
      color: "bg-emerald-100 text-emerald-600"
    }
  ];

  return (
    <main className="text-slate-800 font-sans w-full p-6 md:p-10 lg:p-16 min-h-[calc(100vh-80px)] bg-linear-to-b from-slate-50 to-white overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Hero Greeting */}
        <div className="anim-fade-up space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-600 text-xs font-bold uppercase tracking-widest border border-indigo-100">
            <Sparkles className="w-3 h-3" />
            Welcome Back to Global Wealth
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#0d1f3d] tracking-tighter">
            Hello, <span className="text-indigo-600">{user?.name}</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl leading-relaxed">
            Your centralized financial command center. Select a module below to begin your wealth management journey.
          </p>
        </div>

        {/* Navigation Grid */}
        <div className="anim-fade-up delay-1 flex flex-col gap-6 pb-12">
          {HUB_ITEMS.map((item, idx) => (
            <HubCard key={idx} {...item} />
          ))}
        </div>

        {/* Secondary Info/Quick Stats */}
        <div className="anim-fade-up delay-2 bg-[#0d1f3d] rounded-[3rem] p-10 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
            <TrendingUp className="w-48 h-48" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold mb-4">Ready to optimize your portfolio?</h2>
              <p className="text-slate-400 leading-relaxed">
                Connect your accounts and our AI will automatically scan for high-risk assets and tax optimization opportunities across your global investments.
              </p>
            </div>
            <button className="px-10 py-5 bg-white text-[#0d1f3d] font-bold rounded-2xl hover:bg-slate-100 transition-all shadow-xl active:scale-95 whitespace-nowrap">
              Connect Portfolios
            </button>
          </div>
        </div>
        
        <div className="h-10" />
      </div>
    </main>
  );
}
