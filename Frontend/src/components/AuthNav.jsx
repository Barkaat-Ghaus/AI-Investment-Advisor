import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AuthNav = () => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <nav className="w-full px-8 py-5 flex items-center justify-between border-b border-slate-200/60 bg-white/50 backdrop-blur-md sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:bg-slate-700 transition-colors shadow-sm">
          D
        </div>
        <span className="text-xl font-bold text-slate-800 tracking-tight">DocGen</span>
      </Link>
      
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-slate-500 hidden sm:block">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
        </span>
        <Link 
          to={isLogin ? "/signup" : "/login"}
          className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-[0.98]"
        >
          {isLogin ? "Sign up" : "Log in"}
        </Link>
      </div>
    </nav>
  );
};

export default AuthNav;
