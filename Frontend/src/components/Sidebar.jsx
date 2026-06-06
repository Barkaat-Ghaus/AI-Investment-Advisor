import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/store';
import {
  LayoutDashboard,
  BrainCircuit,
  ShieldCheck,
  BarChart2,
  Target,
  UserCircle,
  History,
  LogOut,
  ChevronRight,
} from 'lucide-react';

export const SIDEBAR_W = 240;

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard',       path: '/home',            icon: LayoutDashboard },
      { label: 'AI Advisor',      path: '/advisor',         icon: BrainCircuit    },
      { label: 'Advisory History',path: '/advisory-history',icon: History         },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { label: 'Risk Analysis',   path: '/risk-analysis',   icon: ShieldCheck     },
      { label: 'Market Data',     path: '/markets',         icon: BarChart2       },
      { label: 'Finance Goals',   path: '/goals',           icon: Target          },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Profile',         path: '/profile',         icon: UserCircle      },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        style={{ width: SIDEBAR_W }}
        className={`
          fixed top-0 left-0 bottom-0 z-50 flex flex-col
          bg-[#090d16] border-r border-white/[0.05]
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* ── Logo ─────────────────────────────────────────── */}
        <div className="px-5 pt-6 pb-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Glow icon */}
            <div className="relative w-9 h-9 shrink-0">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 opacity-30 blur-md" />
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
                <svg width="17" height="17" fill="none" stroke="white" strokeWidth="2.4" viewBox="0 0 24 24">
                  <path d="M3 3v18h18"/>
                  <path d="m19 9-5 5-4-4-3 3"/>
                </svg>
              </div>
            </div>
            <div>
              <div className="text-white text-[13.5px] font-bold leading-tight tracking-tight">
                Global Wealth
              </div>
              <div className="text-slate-500 text-[9px] font-medium tracking-[0.1em] uppercase mt-px">
                AI Investment Advisor
              </div>
            </div>
          </div>

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Nav ──────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-6 py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-2 text-[9px] font-bold text-slate-500 tracking-[0.15em] uppercase select-none">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ label, path, icon: Icon }) => {
                  const active = pathname === path;
                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={onClose}
                      className="no-underline group"
                    >
                      <div
                        className={`
                          relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                          text-[13px] font-medium cursor-pointer
                          transition-all duration-200
                          ${active
                            ? 'bg-gradient-to-r from-indigo-500/10 via-violet-500/5 to-transparent text-indigo-400 font-semibold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                          }
                        `}
                      >
                        {/* Active left pill */}
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-indigo-400 to-violet-500 rounded-full" />
                        )}

                        {/* Icon */}
                        <span className={`
                          shrink-0 flex items-center justify-center w-[30px] h-[30px] rounded-lg
                          transition-all duration-200
                          ${active
                            ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-900/30'
                            : 'bg-white/[0.03] text-slate-500 group-hover:bg-white/[0.06] group-hover:text-slate-300'
                          }
                        `}>
                          <Icon size={14} strokeWidth={active ? 2.2 : 1.8} />
                        </span>

                        <span className="flex-1 leading-none">{label}</span>

                        {/* Active chevron */}
                        {active && (
                          <ChevronRight size={12} className="text-indigo-400/60 shrink-0" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── User profile card ────────────────────────────── */}
        <div className="shrink-0 px-3 pb-5 pt-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-900/40 border border-white/[0.04]">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[11px] font-bold shadow-md shadow-indigo-900/40">
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-[1.5px] border-[#090d16]" />
            </div>

            {/* Name + email */}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-slate-200 truncate leading-tight">
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] text-slate-500 truncate leading-tight mt-px">
                {user?.email || ''}
              </p>
            </div>

            {/* Logout icon button */}
            <button
              onClick={handleLogout}
              title="Log out"
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
