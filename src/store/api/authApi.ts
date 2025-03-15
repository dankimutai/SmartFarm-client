// src/store/api/authApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LoginCredentials, RegisterCredentials, AuthResponse } from "../../types/auth.types";
import { prod } from '../../utils/utils';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: prod,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      transformErrorResponse: (response: { status: number; data: any }) => {
        return {
          status: response.status,
          message: response.data?.message || 'An error occurred during login'
        };
      },
    }),
    register: builder.mutation<AuthResponse, RegisterCredentials>({
      query: (credentials) => ({
        url: '/register',
        method: 'POST',
        body: credentials,
      }),
      transformErrorResponse: (response: { status: number; data: any }) => {
        return {
          status: response.status,
          message: response.data?.message || 'An error occurred during registration'
        };
      },
    }),
  }),
});

