import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const SIDEBAR_W = 220;

const NAV_ITEMS = [
  {
    label: 'Your Home', path: '/home',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    label: 'AI Advisor', path: '/advisor',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  },
  {
    label: 'Risk Analysis', path: '/risk-analysis',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  },
  {
    label: 'Market Data', path: '/markets',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  },
  {
    label: 'Financial Profile', path: '/profile-setup',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  }
];

const BOTTOM_ITEMS = [
  {
    label: 'Logout',
    icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  },
];

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside
      className="fixed top-0 left-0 bottom-0 flex flex-col bg-[#0d1f3d] z-50 shrink-0"
      style={{ width: SIDEBAR_W }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-7">
        <div className="flex items-center gap-2.5">
          <div className="w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br from-[#2a6a3f] to-[#3d9e5f]">
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-[13.5px] leading-tight">Global Wealth</div>
            <div className="text-white/40 text-[9.5px] tracking-[0.07em] font-medium">AI Investment Advisor</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.path;
          return (
            <Link key={item.label} to={item.path} className="no-underline">
              <div
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-[9px] text-[13px] cursor-pointer transition-all duration-150
                  ${active
                    ? 'bg-white/[0.07] text-white font-semibold border-l-[3px] border-[#3d9e5f]'
                    : 'text-white/50 font-normal border-l-[3px] border-transparent hover:text-white/80'
                  }`}
              >
                <span className="shrink-0 flex">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-6">
        <div className="h-px bg-white/8 my-2" />
        {BOTTOM_ITEMS.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[9px] text-white/40 text-[13px] cursor-pointer transition-colors duration-150 hover:text-white/75"
          >
            <span className="shrink-0 flex">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
