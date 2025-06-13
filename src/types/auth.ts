export interface User {
  id: number;
  email: string;
  name: string; // Required field from backend
  first_name?: string; // Optional for backward compatibility
  last_name?: string; // Optional for backward compatibility
  is_active?: boolean;
  is_superuser?: boolean;
  is_admin?: boolean; // Alias for is_superuser for some components
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

export interface AuthError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface PasswordResetData {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: Record<string, unknown> | string;
}
