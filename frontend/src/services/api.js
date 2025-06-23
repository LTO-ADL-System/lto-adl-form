const API_BASE_URL = 'http://localhost:8080/api/v1';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('access_token');
  }

  // Set auth token in localStorage
  setAuthToken(token) {
    localStorage.setItem('access_token', token);
  }

  // Remove auth token from localStorage
  removeAuthToken() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Get default headers
  getHeaders(includeAuth = true, contentType = 'application/json') {
    const headers = {
      'Content-Type': contentType,
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Handle API response
  async handleResponse(response) {
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

  // Generic GET request
  async get(endpoint, includeAuth = true) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(includeAuth),
    });

    return this.handleResponse(response);
  }

  // Generic POST request
  async post(endpoint, data = {}, includeAuth = true) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  // Generic PUT request
  async put(endpoint, data = {}, includeAuth = true) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(includeAuth),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  // Generic DELETE request
  async delete(endpoint, includeAuth = true) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(includeAuth),
    });

    return this.handleResponse(response);
  }

  // File upload request
  async uploadFile(endpoint, formData, includeAuth = true) {
    const headers = {};
    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse(response);
  }

  // Check if user is admin
  isAdmin() {
    const userEmail = localStorage.getItem('user_email');
    return userEmail === 'madalto.official@gmail.com';
  }
}

export default new ApiService(); 