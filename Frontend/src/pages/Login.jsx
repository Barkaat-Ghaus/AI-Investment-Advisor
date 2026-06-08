import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/store';
import AuthNav from '../components/AuthNav';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, verifyToken } = useAuthStore();

  // On mount, check if already logged in with a valid token — if so skip login
  // Also clear any previous errors
  useEffect(() => {
    let isMounted = true;
    clearError();
    verifyToken().then((valid) => {
      if (valid && isMounted) navigate('/home', { replace: true });
    });
    return () => { isMounted = false; };
  }, [clearError, verifyToken]); // eslint-disable-line react-hooks/exhaustive-deps
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: localStorage.getItem('rememberedEmail') || '',
      password: localStorage.getItem('rememberedPassword') || '',
      rememberMe: !!localStorage.getItem('rememberedEmail'),
    }
  });

  const onSubmit = async (data) => {
    clearError();
    const result = await login({ email: data.email, password: data.password });
    if (result.success) {
      if (data.rememberMe) {
        localStorage.setItem('rememberedEmail', data.email);
        localStorage.setItem('rememberedPassword', data.password);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AuthNav />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-1.5">
            Welcome Back
          </h2>
          <p className="text-slate-500 text-sm">Please enter your details to sign in</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`w-full px-4 py-2.5 bg-white border ${
                errors.email ? 'border-red-400 focus:ring-red-400/30 focus:border-red-400' : 'border-slate-200 focus:ring-slate-300 focus:border-slate-400'
              } rounded-xl text-slate-800 focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm`}
              placeholder="Enter your email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                Password
              </label>
              <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              className={`w-full px-4 py-2.5 bg-white border ${
                errors.password ? 'border-red-400 focus:ring-red-400/30 focus:border-red-400' : 'border-slate-200 focus:ring-slate-300 focus:border-slate-400'
              } rounded-xl text-slate-800 focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm`}
              placeholder="••••••••"
              {...register('password', { 
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
            />
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              className="h-4 w-4 text-slate-700 focus:ring-slate-400 border-slate-300 rounded cursor-pointer transition-colors"
              {...register('rememberMe')}
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-slate-600 cursor-pointer">
              Remember for 30 days
            </label>
          </div>

          <div className="space-y-3 pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 flex justify-center text-sm font-semibold rounded-xl text-white ${isLoading ? 'opacity-70 cursor-not-allowed bg-slate-600' : 'bg-[#0d1f3d] active:scale-[0.98]'} transition-all duration-200 shadow-sm`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-slate-800 hover:text-slate-600 transition-colors">
            Sign up
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
