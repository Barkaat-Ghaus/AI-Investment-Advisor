import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/store';

/**
 * ProtectedRoute Component
 * On first mount, calls the backend /api/auth/verify to confirm the stored
 * token is still valid. Shows a spinner while checking. If invalid or missing,
 * redirects immediately to /login.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, token, verifyToken } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    verifyToken().finally(() => setChecking(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
