import { Link } from 'react-router-dom';
import useAuthStore from '../store/store';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 p-8">
        {/* Welcome Section */}
        <div className="max-w-3xl mx-auto w-full mb-8">
          <div className="bg-gradient-to-r from-[#0d1f3d] to-[#1a2f4d] rounded-2xl p-8 text-white shadow-lg">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
            <p className="text-slate-200 text-base">You're logged in and ready to start investing smarter.</p>
          </div>
        </div>

        {/* User Details Card */}
        <div className="max-w-3xl mx-auto w-full mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Account Details</h2>
              <Link
                to="/profile"
                className="text-sm font-semibold text-[#0d1f3d] hover:text-slate-600 transition-colors"
              >
                Edit Profile →
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="border-l-4 border-[#2a6a3f] pl-4">
                <p className="text-sm text-slate-500 mb-1">Full Name</p>
                <p className="text-lg font-semibold text-slate-800">{user.name}</p>
              </div>
              <div className="border-l-4 border-[#0d1f3d] pl-4">
                <p className="text-sm text-slate-500 mb-1">Email Address</p>
                <p className="text-lg font-semibold text-slate-800">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="max-w-3xl mx-auto w-full">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Get Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/advisor"
              className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow no-underline group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#0d1f3d] text-white flex items-center justify-center group-hover:bg-slate-800 transition-colors">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 2l9 5v10l-9 5-9-5V7z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">AI Advisor</h3>
                  <p className="text-sm text-slate-500">Get personalized investment recommendations</p>
                </div>
              </div>
            </Link>

            <Link
              to="/goals"
              className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow no-underline group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#2a6a3f] text-white flex items-center justify-center group-hover:bg-slate-800 transition-colors">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                    <polyline points="13 2 13 9 20 9"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">Financial Goals</h3>
                  <p className="text-sm text-slate-500">Set and track your investment goals</p>
                </div>
              </div>
            </Link>

            <Link
              to="/markets"
              className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow no-underline group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#0d1f3d] text-white flex items-center justify-center group-hover:bg-slate-800 transition-colors">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <line x1="12" y1="2" x2="12" y2="22"/><polyline points="19 5 9 15 15 15 9 21"/><polyline points="5 9 15 9 9 3"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">Market Data</h3>
                  <p className="text-sm text-slate-500">Explore real-time market insights</p>
                </div>
              </div>
            </Link>

            <Link
              to="/risk-analysis"
              className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow no-underline group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#2a6a3f] text-white flex items-center justify-center group-hover:bg-slate-800 transition-colors">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">Risk Analysis</h3>
                  <p className="text-sm text-slate-500">Assess your investment risk profile</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-12 tracking-wide text-center">
          EQUILIBRIUM FINANCE © 2024 · For informational purposes only
        </p>
      </div>
    );
  }

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