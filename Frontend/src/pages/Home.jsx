import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-6 font-sans">
      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg px-12 py-14 max-w-lg w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-7">
          <div className="w-14 h-14 rounded-xl bg-[#0d1f3d] flex items-center justify-center">
            <svg width="26" height="26" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
            </svg>
          </div>
        </div>

        <p className="text-[11px] font-bold text-[#2a6a3f] tracking-widest mb-3.5 uppercase">
          Institutional Grade
        </p>
        <h1 className="text-4xl font-extrabold text-[#0d1f3d] mb-3 tracking-tight leading-tight">
          Global Wealth Advisor
        </h1>
        <p className="text-[15px] text-slate-500 leading-relaxed mb-9">
          AI-powered portfolio analysis and investment planning for sophisticated investors.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            to="/advisor"
            className="px-7 py-3 rounded-lg bg-[#0d1f3d] text-white text-sm font-semibold no-underline transition-opacity hover:opacity-90"
          >
            Open Platform
          </Link>
          <Link
            to="/dashboard"
            className="px-7 py-3 rounded-lg bg-[#2a6a3f] text-white text-sm font-semibold no-underline transition-opacity hover:opacity-90"
          >
            Dashboard
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-lg bg-slate-50 text-[#0d1f3d] text-sm font-semibold no-underline border border-slate-200 transition-colors hover:bg-slate-100"
          >
            Sign In
          </Link>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-7 tracking-wide">
        EQUILIBRIUM FINANCE © 2024 · For informational purposes only
      </p>
    </div>
  );
}