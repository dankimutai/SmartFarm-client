export type Role = 'farmer' | 'buyer' | 'admin';

export interface User {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    image?: string;
    role: Role;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface UsersResponse {
    success: boolean;
    data: User[];
    total: number;
    page: number;
    totalPages: number;
  }
  
  export interface CreateUserDto {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    image?: string;
    role?: Role;
  }
  
  export interface UpdateUserDto {
    name?: string;
    email?: string;
    phoneNumber?: string;
    image?: string;
    role?: Role;
  }
  
  export interface UsersQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
    sortBy?: string;
  }
