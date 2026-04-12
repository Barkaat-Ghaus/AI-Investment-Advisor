import { create } from 'zustand';
import API_BASE_URL from '../config/api';

const API_URL = `${API_BASE_URL}/api/auth`;

// Safe localStorage getter for SSR compatibility
const getStoredToken = () => {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem('token') || null : null;
  } catch {
    return null;
  }
};

const useAuthStore = create((set) => ({
  user: null,
  token: getStoredToken(),
  isAuthenticated: !!getStoredToken(),
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      try {
        localStorage.setItem('token', data.token);
      } catch (e) {
        console.warn('Failed to store token:', e);
      }

      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  signup: async (userData) => {
    set({ isLoading: true, error: null });
    try {
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
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Auto-login after signup
      try {
        localStorage.setItem('token', data.token);
      } catch (e) {
        console.warn('Failed to store token:', e);
      }

      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true, message: 'Account created successfully!' };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  logout: () => {
    try {
      localStorage.removeItem('token');
    } catch (e) {
      console.warn('Failed to remove token:', e);
    }
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },
  
  clearError: () => set({ error: null })
}));

export default useAuthStore;
