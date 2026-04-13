import { useEffect } from 'react';
import useAuthStore from '../store/store';

/**
 * useAuthCheckOnMount Hook
 * Verifies user authentication status on app initialization
 * Restores auth state from localStorage if available
 * 
 * Usage: Add this hook to your root component or App wrapper
 * Example: useAuthCheckOnMount();
 * 
 * This hook is automatically handled by the store's getStoredToken() function,
 * but it's useful for adding custom initialization logic if needed
 */
export const useAuthCheckOnMount = () => {
  const { isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Check if token exists in localStorage
        const storedToken = localStorage.getItem('token');
        
        if (storedToken && isAuthenticated) {
          // Token exists and user is marked as authenticated
          // Auth store already has the token from getStoredToken()
          if (process.env.NODE_ENV === 'development') {
            console.log('✓ Authentication restored from localStorage');
          }
        } else if (!storedToken) {
          // No token - user is not authenticated
          if (process.env.NODE_ENV === 'development') {
            console.log('ℹ No authentication token found');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear auth state on error
        try {
          localStorage.removeItem('token');
        } catch (e) {
          // Silently fail if localStorage is not available
        }
      }
    };

    initializeAuth();
  }, [isAuthenticated, token]);
};

export default useAuthCheckOnMount;
