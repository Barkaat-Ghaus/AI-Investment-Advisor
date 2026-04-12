import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SIDEBAR_W } from './Sidebar';
import useAuthStore from '../store/store';

const TABS = [
  { label: 'Your Home',    path: '/home' },
  { label: 'AI Advisor',   path: '/advisor'    },
  { label: 'Goals',        path: '/goals'      },
  { label: 'Risk Analysis',path: '/risk-analysis' },
  { label: 'Market Data',  path: '/markets'    },
  { label: 'Profile',      path: '/profile'    },
];

export default function TopBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 flex items-center bg-white border-b border-slate-200 h-[60px] px-8 gap-0">

      {/* App title */}
      <span className="text-[14px] font-bold text-[#0d1f3d] mr-8 shrink-0 whitespace-nowrap">
        AI Investment Advisor
      </span>

      {/* Tabs */}
      <nav className="flex items-stretch flex-1 gap-0">
        {TABS.map((tab) => {
          const active = pathname === tab.path;
          return (
            <Link key={tab.label} to={tab.path} className="no-underline">
              <button
                className={`h-[60px] px-4 text-[13px] bg-transparent border-none cursor-pointer whitespace-nowrap flex items-center transition-colors duration-150
                  border-b-2 border-t-2 border-t-transparent
                  ${active
                    ? 'font-semibold text-[#0d1f3d] border-b-[#0d1f3d]'
                    : 'font-normal text-slate-400 border-b-transparent hover:text-slate-600'
                  }`}
              >
                {tab.label}
              </button>
            </Link>
          );
        })}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-4 ml-6 shrink-0">
        {isAuthenticated ? (
          <>
            {/* Bell */}
            <button className="relative p-1 text-slate-400 bg-transparent border-none cursor-pointer flex items-center">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="absolute top-0.5 right-0.5 w-[7px] h-[7px] rounded-full bg-red-500 border-[1.5px] border-white" />
            </button>

            {/* Avatar */}
            <Link to="/profile" className="no-underline">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-bold cursor-pointer select-none bg-gradient-to-br from-[#2a6a3f] to-[#3d9e5f] hover:opacity-90 transition-opacity">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="bg-transparent border-none cursor-pointer text-[13px] font-semibold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="no-underline">
              <button className="bg-transparent border-none text-[#0d1f3d] text-[14px] font-semibold cursor-pointer px-4 py-2 hover:text-slate-600 transition-colors">
                Log in
              </button>
            </Link>
            <Link to="/signup" className="no-underline">
              <button className="bg-[#0d1f3d] text-white border-none rounded-lg text-[14px] font-semibold cursor-pointer px-4 py-2 shadow-md hover:opacity-90 transition-opacity">
                Sign up
              </button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
