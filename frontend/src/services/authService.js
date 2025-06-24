import apiService from './api.js';

class AuthService {
  // Send signup OTP
  async signUpRequest(email, password) {
    const response = await apiService.post('/auth-supabase/sign-up-request', {
      email,
      password
    }, false);
    return response;
  }

  // Send login OTP
  async loginRequest(email, password) {
    const response = await apiService.post('/auth-supabase/login-request', {
      email,
      password
    }, false);
    return response;
  }

  // Verify OTP for signup or login
  async verifyOTP(email, otpCode, action, password = null) {
    const payload = {
      email,
      otp_code: otpCode,
      action
    };

    if (action === 'login' && password) {
      payload.password = password;
    }

    const response = await apiService.post('/auth-supabase/verify-otp', payload, false);
    
    if (response.success && response.data) {
      // Store tokens and user info
      apiService.setAuthToken(response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem('user_email', response.data.user.email);
      localStorage.setItem('user_id', response.data.user.id);
    }

    return response;
  }

  // Refresh access token
  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiService.post('/auth-supabase/refresh-token', {
      refresh_token: refreshToken
    }, false);

    if (response.success && response.data) {
      apiService.setAuthToken(response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }

    return response;
  }

  // Get user profile
  async getUserProfile(email) {
    const response = await apiService.get(`/auth-supabase/user-profile?email=${encodeURIComponent(email)}`);
    return response;
  }

  // Verify token
  async verifyToken(token) {
    const response = await apiService.get(`/auth-supabase/verify-token?token=${encodeURIComponent(token)}`, false);
    return response;
  }

  // Logout
  logout() {
    apiService.removeAuthToken();
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_id');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!apiService.getAuthToken();
  }

  // Get current user info from localStorage
  getCurrentUser() {
    if (!this.isAuthenticated()) {
      return null;
    }

    return {
      id: localStorage.getItem('user_id'),
      email: localStorage.getItem('user_email'),
      isAdmin: apiService.isAdmin()
    };
  }

  // Auto-refresh token before it expires
  async autoRefreshToken() {
    try {
      await this.refreshToken();
      return true;
    } catch (error) {
      console.error('Auto refresh failed:', error);
      this.logout();
      return false;
    }
  }
}

export default new AuthService(); 