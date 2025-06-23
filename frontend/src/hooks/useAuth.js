import { useState, useEffect, useContext, createContext } from 'react';
import authService from '../services/authService.js';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on app start
  useEffect(() => {
    const initializeAuth = () => {
      if (authService.isAuthenticated()) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Auto refresh token periodically
  useEffect(() => {
    if (isAuthenticated) {
      const refreshInterval = setInterval(async () => {
        try {
          await authService.autoRefreshToken();
        } catch (error) {
          console.error('Auto refresh failed:', error);
          logout();
        }
      }, 15 * 60 * 1000); // Refresh every 15 minutes

      return () => clearInterval(refreshInterval);
    }
  }, [isAuthenticated]);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sign up request
  const signUpRequest = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.signUpRequest(email, password);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login request
  const loginRequest = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.loginRequest(email, password);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async (email, otpCode, action, password = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.verifyOTP(email, otpCode, action, password);
      
      if (response.success && response.data) {
        const userData = {
          id: response.data.user.id,
          email: response.data.user.email,
          isAdmin: response.data.user.email === 'madalto.official@gmail.com'
        };
        context.login(userData);
      }
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh token
  const refreshToken = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.refreshToken();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get user profile
  const getUserProfile = async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.getUserProfile(email);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verify token
  const verifyToken = async (token) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.verifyToken(token);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return {
    ...context,
    loading,
    error,
    signUpRequest,
    loginRequest,
    verifyOTP,
    refreshToken,
    getUserProfile,
    verifyToken,
    clearError
  };
};

// Hook to check if user is admin
export const useIsAdmin = () => {
  const { user } = useAuth();
  return user?.isAdmin || false;
};

// Hook to require authentication
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login page
      window.location.href = '/signin';
    }
  }, [isAuthenticated, isLoading]);

  return { isAuthenticated, isLoading };
};

// Hook to require admin access
export const useRequireAdmin = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const isAdmin = user?.isAdmin || false;
  
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        window.location.href = '/signin';
      } else if (!isAdmin) {
        window.location.href = '/'; // Redirect to home if not admin
      }
    }
  }, [isAuthenticated, isLoading, isAdmin]);

  return { isAuthenticated, isAdmin, isLoading };
}; 