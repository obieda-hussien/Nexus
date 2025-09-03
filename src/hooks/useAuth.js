import { useAuth } from '../contexts/AuthContext';

// Hook for accessing authentication context
export { useAuth };

// Hook for checking if user is authenticated
export const useIsAuthenticated = () => {
  const { currentUser } = useAuth();
  return !!currentUser;
};

// Hook for getting current user profile
export const useUserProfile = () => {
  const { currentUser, userProfile } = useAuth();
  return { currentUser, userProfile };
};