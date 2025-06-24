import apiService from './api.js';

class AuthService {
  // Send signup OTP
  async signUpRequest(email, password) {
    // Send email and password as query parameters
    const params = new URLSearchParams({
      email: email,
      password: password
    });

    const response = await fetch(`${apiService.baseURL}/auth-supabase/sign-up-request?${params.toString()}`, {
      method: 'POST',
      headers: {
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  // Send login OTP
  async loginRequest(email, password) {
    // Send email and password as query parameters
    const params = new URLSearchParams({
      email: email,
      password: password
    });

    const response = await fetch(`${apiService.baseURL}/auth-supabase/login-request?${params.toString()}`, {
      method: 'POST',
      headers: {
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  // Verify OTP for signup or login
  async verifyOTP(email, otpCode, action, password = null) {
    // Send as query parameters for verify-otp endpoint
    const params = new URLSearchParams({
      email: email,
      otp_code: otpCode,
      action: action
    });
    
    // Include password for both signup and login actions
    if (password) {
      params.append('password', password);
    }

    const response = await fetch(`${apiService.baseURL}/auth-supabase/verify-otp?${params.toString()}`, {
      method: 'POST',
      headers: {
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'API request failed');
    }

    if (data.success && data.data) {
      // Store tokens and user info
      apiService.setAuthToken(data.data.access_token);
      localStorage.setItem('refresh_token', data.data.refresh_token);
      localStorage.setItem('user_email', data.data.email);
      localStorage.setItem('user_id', data.data.user_id);
    }

    return data;
  }

  // Refresh access token
  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Send refresh_token as query parameter
    const params = new URLSearchParams({
      refresh_token: refreshToken
    });

    const response = await fetch(`${apiService.baseURL}/auth-supabase/refresh-token?${params.toString()}`, {
      method: 'POST',
      headers: {
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'API request failed');
    }

    if (data.success && data.data) {
      apiService.setAuthToken(data.data.access_token);
      localStorage.setItem('refresh_token', data.data.refresh_token);
    }

    return data;
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