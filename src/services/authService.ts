import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
// Import types from the types file
import type { 
  User, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  RefreshTokenResponse 
} from '../types/auth';


const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base URL and common headers
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies and CORS
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // If the error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const { access_token } = await refreshToken();
        
        if (!access_token) {
          throw new Error('No access token received');
        }
        
        // Save the new token
        localStorage.setItem('token', access_token);
        
        // Update the Authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }
        
        // Retry the original request with the new token
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, log the user out
        console.error('Token refresh failed:', refreshError);
        await logoutUser();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth service methods
export const authService = {
  // Register a new user
  async register(userData: RegisterData): Promise<{ user: User; access_token: string }> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      const { access_token, user } = response.data;
      
      // Store the token in local storage
      if (access_token) {
        localStorage.setItem('token', access_token);
      }
      
      return { user, access_token };
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  // Login user
  async login(credentials: LoginCredentials): Promise<{ user: User; access_token: string }> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      const { access_token, user } = response.data;
      
      // Store the token in local storage
      if (access_token) {
        localStorage.setItem('token', access_token);
      }
      
      return { user, access_token };
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always remove tokens from local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Token is invalid or expired, try to refresh
        try {
          const { access_token } = await refreshToken();
          if (access_token) {
            localStorage.setItem('token', access_token);
            // Retry getting the user after token refresh
            const retryResponse = await api.get<User>('/auth/me');
            return retryResponse.data;
          }
          return null;
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          await logoutUser();
          return null;
        }
      }
      console.error('Failed to get current user:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      // Check if token is expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      console.error('Error checking token:', error);
      return false;
    }
  }
};

// Helper function to refresh the access token
async function refreshToken(): Promise<{ access_token: string }> {
  const response = await api.post<RefreshTokenResponse>('/auth/refresh');
  return response.data;
}

// Helper function to handle auth errors
function handleAuthError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || 'An error occurred during authentication';
    return new Error(message);
  }
  return new Error('An unknown error occurred');
}

// Logout function to be used when token refresh fails
const logoutUser = async (): Promise<void> => {
  // Clear tokens from storage
  localStorage.removeItem('token');
  // Clear axios default headers
  // Use null assignment instead of delete
  if (api.defaults.headers.common) {
    api.defaults.headers.common.Authorization = null;
  }
  // Redirect to login page
  window.location.href = '/login';
}

// Export all functions individually for named imports
export const login = authService.login;
export const register = authService.register;
export const logout = authService.logout;
export const getCurrentUser = authService.getCurrentUser;
export const isAuthenticated = authService.isAuthenticated;

export default authService;
