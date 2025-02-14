export interface Users {
    id: number;
    name: string;
    email: string;
    role: 'farmer' | 'buyer' | 'admin';
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterCredentials extends LoginCredentials {
    name: string;
    role: 'farmer' | 'buyer';
  }
  
  export interface AuthResponse {
    user: Users;
    token: string;
  }