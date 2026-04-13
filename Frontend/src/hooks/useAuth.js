import useAuthStore from '../store/store';

/**
 * useIsAuthenticated Hook
 * Simple hook to check if user is currently authenticated
 * 
 * Usage in any component:
 * const isLoggedIn = useIsAuthenticated();
 * 
 * Returns: boolean (true if user is logged in, false otherwise)
 */
export const useIsAuthenticated = () => {
  try {
    const { isAuthenticated, token } = useAuthStore();
    return isAuthenticated && !!token;
  } catch {
    return false;
  }
};

/**
 * useAuthUser Hook
 * Get currently logged-in user information
 * 
 * Usage in any component:
 * const { user, token, logout } = useAuthUser();
 * 
 * Returns: { user, token, logout, isAuthenticated }
 */
export const useAuthUser = () => {
  const { user, token, logout, isAuthenticated } = useAuthStore();
  
  return {
    user,
    token,
    logout,
    isAuthenticated: isAuthenticated && !!token,
  };
};

/**
 * useRequireAuth Hook
 * Automatically redirect to login if not authenticated
 * Use this in protected pages as a safeguard
 * 
 * Usage in a protected page component:
 * export default function MyPage() {
 *   const user = useRequireAuth();
 *   if (!user) return null; // Will auto-redirect
 *   
 *   return <div>Welcome {user.name}!</div>;
 * }
 */
export const useRequireAuth = () => {
  const { user, isAuthenticated, token } = useAuthStore();
  
  // Return user object if authenticated, undefined if not
  return (isAuthenticated && token) ? user : null;
};

export default useIsAuthenticated;
