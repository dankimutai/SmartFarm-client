// src/utils/authUtils.ts

/**
 * Utility functions for authentication and API handling
 */

// Environment configuration
export const prodDomain = import.meta.env.PROD 
  ? 'https://smartfarm-production-d317.up.railway.app' 
  : 'https://smartfarm-production-d317.up.railway.app';

// Error formatting types
type ErrorResponse = {
  status: number;
  data: {
    message?: string;
    errors?: Record<string, string>;
  };
};

type NetworkError = {
  status: 'FETCH_ERROR';
  error: string;
};

// Token management
const AUTH_TOKEN_KEY = 'smartfarm-auth-token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
};

export const setAuthToken = (token: string, persist: boolean = false): void => {
  const storage = persist ? localStorage : sessionStorage;
  storage.setItem(AUTH_TOKEN_KEY, token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
};

// Error handling utilities
export const formatError = (error: ErrorResponse | NetworkError): string => {
  if ('data' in error) {
    return error.data.message || 'An unexpected error occurred';
  }
  return error.error || 'Network error occurred';
};

export const isRtkQueryError = (error: unknown): error is ErrorResponse => {
  return typeof error === 'object' && error !== null && 'status' in error;
};

// API headers formatter
export const authHeader = (): { Authorization: string } | {} => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Environment checker
export const getEnvironment = (): 'development' | 'production' | 'test' => {
  return import.meta.env.MODE as 'development' | 'production' | 'test';
};

// Response handler
// export const handleAuthResponse = (response: any): AuthResponse => {
//   if (response.data?.token) {
//     setAuthToken(response.data.token, response.data.persist);
//   }
//   return response.data;
// };

/**
 * Usage in API configuration:
 * 
 * baseQuery: fetchBaseQuery({
 *   baseUrl: prodDomain,
 *   prepareHeaders: (headers) => {
 *     const token = getAuthToken();
 *     if (token) headers.set('Authorization', `Bearer ${token}`);
 *     return headers;
 *   }
 * }),
 */
