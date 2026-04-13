import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { History, TrendingUp } from 'lucide-react';
import useAuthStore from '../store/store';
import AdvisoryHistory from '../components/AdvisoryHistory';

export default function AdvisoryHistoryPage() {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuthStore();

  // Redirect immediately on render — no flash of protected content
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <main className="flex-1 px-10 pt-9 pb-16 max-w-7xl">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <History className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-[10.5px] font-bold text-indigo-600 tracking-[0.14em] uppercase">
              Investment Advisory
            </p>
          </div>
          <h1 className="text-[clamp(24px,3vw,36px)] font-extrabold text-[#0d1f3d] leading-tight tracking-tight">
            Your Advisory History
          </h1>
          <p className="text-slate-600 mt-2">View and manage all your saved investment advisories</p>
        </div>

        {/* Advisory History Component */}
        <AdvisoryHistory />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-10 py-3.5 flex justify-between items-center flex-wrap gap-2">
        <span className="text-[11px] text-slate-400 font-medium tracking-[0.06em] uppercase">
          Global Wealth Management © 2025
        </span>
        <div className="flex gap-6">
          {['Privacy Policy', 'Risk Disclosure', 'Institutional Terms'].map(l => (
            <button
              key={l}
              className="bg-transparent border-none cursor-pointer text-[10.5px] text-slate-400 font-medium tracking-[0.06em] uppercase hover:text-[#0d1f3d] transition-colors"
            >
              {l}
            </button>
          ))}
        </div>
      </footer>
    </>
  );
}
