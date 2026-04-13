import React, { useState } from 'react';
import useAuthStore from '../store/store';
import { useIsAuthenticated, useAuthUser } from '../hooks/useAuth';

/**
 * AuthDebugPanel Component
 * 
 * For development/debugging only. Shows auth state and allows manual testing.
 * 
 * Usage (add to any page in dev):
 * import AuthDebugPanel from './components/AuthDebugPanel';
 * 
 * <AuthDebugPanel />
 */
export default function AuthDebugPanel() {
  const [showPanel, setShowPanel] = useState(false);
  const isLoggedIn = useIsAuthenticated();
  const authUser = useAuthUser();
  const { token, isAuthenticated, user, logout } = useAuthStore();
  const [forceRestore, setForceRestore] = useState(false);

  const handleRestoreAuth = () => {
    const store = useAuthStore.getState();
    store.restoreAuthFromStorage();
    setForceRestore(true);
    setTimeout(() => setForceRestore(false), 2000);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleClearAll = () => {
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
    window.location.reload();
  };

  if (!showPanel) {
    return (
      <button
        onClick={() => setShowPanel(true)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 transition-colors"
        title="Open Auth Debug Panel"
      >
        🔐
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 bg-white rounded-2xl shadow-2xl border-2 border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">🔐 Auth Debug Panel</h3>
        <button
          onClick={() => setShowPanel(false)}
          className="text-slate-400 hover:text-slate-600 font-bold text-xl"
        >
          ✕
        </button>
      </div>

      {/* Status Indicator */}
      <div className={`p-3 rounded-lg mb-4 ${isLoggedIn ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <p className="text-sm font-semibold">
          Status: <span className={isLoggedIn ? 'text-green-600' : 'text-red-600'}>
            {isLoggedIn ? '✓ Logged In' : '✗ Not Logged In'}
          </span>
        </p>
      </div>

      {/* Auth State */}
      <div className="space-y-3 mb-4 bg-slate-50 p-3 rounded-lg text-sm font-mono max-h-64 overflow-y-auto">
        <div>
          <span className="text-slate-600">token:</span>
          <span className="text-blue-600 ml-1">{token ? `${token.substring(0, 20)}...` : 'null'}</span>
        </div>
        <div>
          <span className="text-slate-600">isAuthenticated:</span>
          <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'} > {isAuthenticated ? 'true' : 'false'}</span>
        </div>
        <div>
          <span className="text-slate-600">localStorage.token:</span>
          <span className="text-blue-600 ml-1">{localStorage.getItem('token') ? 'exists' : 'null'}</span>
        </div>
        <div>
          <span className="text-slate-600">User:</span>
          <span className="text-purple-600 ml-1">{user ? user.email : 'null'}</span>
        </div>
        {authUser.user && (
          <div>
            <span className="text-slate-600">User Name:</span>
            <span className="text-purple-600 ml-1">{authUser.user.name}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleRestoreAuth}
          className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors"
        >
          {forceRestore ? '✓ Restored' : 'Restore Auth from Storage'}
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-semibold transition-colors"
        >
          Logout & Go to Login
        </button>

        <button
          onClick={handleClearAll}
          className="w-full p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold transition-colors"
        >
          Clear All & Reload
        </button>

        <button
          onClick={() => {
            const state = useAuthStore.getState();
            console.log('Full Auth Store State:', state);
            alert('Check console for full auth state');
          }}
          className="w-full p-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm font-semibold transition-colors"
        >
          Log Full State to Console
        </button>
      </div>

      <p className="text-xs text-slate-500 mt-4 text-center">
        🔍 For development debugging only
      </p>
    </div>
  );
}
