import useAuthStore from '../store/store';

/**
 * Auth Debugger Utility
 * Helps diagnose authentication issues
 * 
 * Usage in browser console:
 * import { debugAuth } from './utils/authDebugger';
 * debugAuth.logStatus();
 * debugAuth.getToken();
 * debugAuth.getUser();
 * debugAuth.forceLogout();
 * debugAuth.forceReset();
 */

export const debugAuth = {
  // Log complete auth state
  logStatus: () => {
    const store = useAuthStore.getState();
    console.clear();
    console.log('=== AUTH STATUS ===');
    console.log('isAuthenticated:', store.isAuthenticated);
    console.log('token:', store.token);
    console.log('user:', store.user);
    console.log('isLoading:', store.isLoading);
    console.log('error:', store.error);
    console.log('localStorage token:', localStorage.getItem('token'));
    console.log('==================');
  },

  // Get token
  getToken: () => {
    const store = useAuthStore.getState();
    console.log('Token:', store.token);
    return store.token;
  },

  // Get user
  getUser: () => {
    const store = useAuthStore.getState();
    console.log('User:', store.user);
    return store.user;
  },

  // Get full state
  getState: () => {
    const store = useAuthStore.getState();
    console.log('Full Auth State:', store);
    return store;
  },

  // Force logout
  forceLogout: () => {
    const store = useAuthStore.getState();
    store.logout();
    console.log('Forced logout. Redirecting...');
    window.location.href = '/login';
  },

  // Force reset (clear everything)
  forceReset: () => {
    localStorage.removeItem('token');
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
      isLoading: false,
    });
    console.log('Auth state reset. Please refresh page.');
  },

  // Check localStorage
  checkLocalStorage: () => {
    const token = localStorage.getItem('token');
    console.log('localStorage.token exists:', !!token);
    console.log('localStorage.token value:', token);
    return token;
  },

  // Simulate login response
  simulateLogin: () => {
    const mockUser = { id: '123', name: 'Test User', email: 'test@example.com' };
    const mockToken = 'mock_token_' + Math.random().toString(36).substr(2, 9);
    
    localStorage.setItem('token', mockToken);
    useAuthStore.setState({
      user: mockUser,
      token: mockToken,
      isAuthenticated: true,
      isLoading: false,
    });
    
    console.log('Simulated login. Auth state:');
    debugAuth.logStatus();
  },
};

export default debugAuth;
