import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/store';
import {
  Menu,
  Bell,
  ChevronDown,
  LogOut,
  UserCircle,
  Settings,
  Sparkles,
} from 'lucide-react';

const PAGE_TITLES = {
  '/home':             { label: 'Dashboard',        sub: 'Your financial overview' },
  '/advisor':          { label: 'AI Advisor',        sub: 'Personalised investment advice' },
  '/risk-analysis':    { label: 'Risk Analysis',     sub: 'Understand your portfolio risk' },
  '/markets':          { label: 'Market Data',       sub: 'Live global market performance' },
  '/goals':            { label: 'Finance Goals',     sub: 'Plan and track your goals' },
  '/profile':          { label: 'Profile',           sub: 'Manage your account' },
  '/profile-setup':    { label: 'Financial Profile', sub: 'Set up your investment profile' },
  '/advisory-history': { label: 'Advisory History',  sub: 'Your saved advisories' },
};

export default function TopBar({ onMenuToggle }) {
  const { pathname }    = useLocation();
  const navigate        = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const dropRef = useRef(null);

  const page     = PAGE_TITLES[pathname] || { label: 'AI Investment Advisor', sub: '' };
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 h-[64px] flex items-center gap-4 px-4 sm:px-6
      bg-white/80 backdrop-blur-xl border-b border-slate-200/80
      shadow-[0_1px_0_0_rgba(0,0,0,0.04)]"
    >

      {/* ── Hamburger (mobile) ─────────────────────────── */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl
          text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </button>

      {/* ── Page title ─────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-[15px] font-bold text-[#0d1f3d] tracking-tight truncate leading-tight">
            {page.label}
          </h1>
          {pathname === '/advisor' && (
            <span className="hidden sm:flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 leading-none">
              <Sparkles size={9} />
              AI-Powered
            </span>
          )}
        </div>
        {page.sub && (
          <p className="hidden sm:block text-[11px] text-slate-400 font-medium leading-tight mt-px truncate">
            {page.sub}
          </p>
        )}
      </div>

      {/* ── Right actions ──────────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">
        {isAuthenticated ? (
          <>
            {/* Notification bell */}
            <button className="relative flex items-center justify-center w-9 h-9 rounded-xl
              text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              <Bell size={17} />
              {/* Unread dot */}
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            {/* ── Avatar + dropdown ── */}
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-2.5 pl-1 pr-2.5 py-1 rounded-xl
                  hover:bg-slate-100 transition-all duration-200 group"
              >
                {/* Avatar ring */}
                <div className="relative w-8 h-8 shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600
                    flex items-center justify-center text-white text-[11px] font-bold
                    shadow-md shadow-emerald-200 ring-2 ring-white">
                    {initials}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                </div>

                <div className="hidden sm:block text-left min-w-0">
                  <p className="text-[12px] font-semibold text-slate-700 leading-tight truncate max-w-[100px]">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Investor
                  </p>
                </div>

                <ChevronDown
                  size={13}
                  className={`hidden sm:block text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56
                  bg-white rounded-2xl border border-slate-200/80
                  shadow-xl shadow-slate-200/60
                  py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-[13px] font-bold text-slate-800 truncate">{user?.name || 'User'}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email || ''}</p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1.5">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="no-underline"
                    >
                      <button className="w-full flex items-center gap-3 px-4 py-2.5
                        text-[13px] text-slate-600 font-medium
                        hover:bg-slate-50 hover:text-slate-900
                        transition-colors text-left"
                      >
                        <UserCircle size={15} className="text-slate-400" />
                        My Profile
                      </button>
                    </Link>
                    <Link
                      to="/profile-setup"
                      onClick={() => setDropdownOpen(false)}
                      className="no-underline"
                    >
                      <button className="w-full flex items-center gap-3 px-4 py-2.5
                        text-[13px] text-slate-600 font-medium
                        hover:bg-slate-50 hover:text-slate-900
                        transition-colors text-left"
                      >
                        <Settings size={15} className="text-slate-400" />
                        Financial Profile
                      </button>
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-100 py-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5
                        text-[13px] text-red-500 font-medium
                        hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut size={15} />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="no-underline">
              <button className="px-4 py-2 text-[13px] font-semibold text-slate-600
                hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-100">
                Log in
              </button>
            </Link>
            <Link to="/signup" className="no-underline">
              <button className="px-4 py-2 bg-[#0d1f3d] text-white text-[13px] font-semibold
                rounded-xl shadow-sm hover:bg-[#162d54] transition-all">
                Sign up
              </button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
