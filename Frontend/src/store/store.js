import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import API_BASE_URL from '../config/api';

const API_URL = `${API_BASE_URL}/api/auth`;

// Module-level lock — prevents concurrent verifyToken calls (StrictMode, Zustand persist, etc.)
let isVerifying = false;

// Safe localStorage getter for SSR compatibility

const getStoredToken = () => {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem('token') || null : null;
  } catch {
    return null;
  }
};

// Safe localStorage getter for user data
const getStoredUser = () => {
  try {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const useAuthStore = create(
  persist(
    (set) => ({
      user: getStoredUser(),
      token: getStoredToken(),
      isAuthenticated: !!getStoredToken(),
      isLoading: false,
      error: null,

      login: async ({ email, password }) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(new Error('Request timeout')), 60000); // 60 second timeout for Render cold starts
          
          const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Login failed');
          }

          try {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
          } catch (e) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('Failed to store token/user:', e);
            }
          }

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          return { success: true };
        } catch (error) {
          const isTimeout = error.name === 'AbortError' || error.message === 'Request timeout' || error.message?.includes('aborted');
          const errorMessage = isTimeout
            ? 'Request timeout - please try again' 
            : error.message;
          set({ error: errorMessage, isLoading: false });
          return { success: false };
        }
      },

      signup: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(new Error('Request timeout')), 60000); // 60 second timeout for Render cold starts
          
          const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: userData.name,
              email: userData.email,
              password: userData.password,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Signup failed');
          }

          // Auto-login after signup
          try {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
          } catch (e) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('Failed to store token/user:', e);
            }
          }

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          return { success: true, message: 'Account created successfully!' };
        } catch (error) {
          const isTimeout = error.name === 'AbortError' || error.message === 'Request timeout' || error.message?.includes('aborted');
          const errorMessage = isTimeout
            ? 'Request timeout - please try again' 
            : error.message;
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      logout: () => {
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } catch (e) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Failed to remove auth data:', e);
          }
        }
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },
      
      // Restore authentication from localStorage (called on app init)
      restoreAuthFromStorage: () => {
        try {
          const storedToken = localStorage.getItem('token');
          const storedUser = localStorage.getItem('user');
          
          if (storedToken) {
            const user = storedUser ? JSON.parse(storedUser) : null;
            
            set({
              token: storedToken,
              user: user,
              isAuthenticated: true,
              isLoading: false,
            });
            
            if (process.env.NODE_ENV === 'development') {
              console.log('✓ Auth restored from localStorage', { 
                token: storedToken ? 'exists' : 'null', 
                user: user?.name || 'null' 
              });
            }
            
            return true;
          } else {
            set({
              token: null,
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return false;
          }
        } catch (error) {
          console.error('Error restoring auth:', error);
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return false;
        }
      },
      
      // Called on app load — hits the backend to confirm the token is still valid
      verifyToken: async () => {
        // Prevent concurrent calls (StrictMode double-invoke, persist re-subscriptions, etc.)
        if (isVerifying) return !!getStoredToken();
        isVerifying = true;

        const token = getStoredToken();
        if (!token) {
          isVerifying = false;
          set({ user: null, token: null, isAuthenticated: false });
          return false;
        }
        try {
          // Add timeout to verification to avoid blocking app on long Render cold starts
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
          
          const response = await fetch(`${API_URL}/verify`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            // Only update state if something actually changed
            set((prev) => {
              if (prev.isAuthenticated && prev.token === token) return prev;
              return { user: data.user, token, isAuthenticated: true };
            });
            return true;
          } else {
            // If the server returns 401 or 403, the token is truly invalid/expired.
            if (response.status === 401 || response.status === 403) {
              if (process.env.NODE_ENV === 'development') {
                console.warn(`Token verification failed (Unauthorized): ${response.status}`);
              }
              const currentToken = getStoredToken();
              if (currentToken === token) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                set({ user: null, token: null, isAuthenticated: false });
              }
              return false;
            } else {
              // 404 (endpoint not deployed yet) or 500 (server issue)
              // Gracefully handle by keeping local state to avoid logging out users due to server/deployment issues
              if (process.env.NODE_ENV === 'development') {
                console.warn(`Token verification endpoint issue (Status: ${response.status}). Keeping local auth state.`);
              }
              return !!token;
            }
          }
        } catch (error) {
          // Network error or timeout — keep existing local state, don't force logout
          if (process.env.NODE_ENV === 'development') {
             console.warn(`Token verification network/timeout error: ${error.message}. Keeping local auth state.`);
          }
          return !!token;
        } finally {
          isVerifying = false;
        }
      },

      clearError: () => set({ error: null })

    }),
    {
      name: 'auth-storage', // localStorage key
    }
  )
);

export default useAuthStore;
