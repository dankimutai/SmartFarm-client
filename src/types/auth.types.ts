// src/types/auth.types.ts

// User roles
export type Role = 'farmer' | 'buyer' | 'admin';

// Base user type matching database schema
export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  image?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Registration credentials
export interface RegisterCredentials {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: Role;
}

// Auth response from API
export interface AuthResponse {
  user: User;
  token: string;
}

// Current auth state
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// JWT decoded payload
export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: Role;
  iat: number;
  exp: number;
}