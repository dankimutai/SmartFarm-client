import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { UsersResponse, UsersQueryParams, User } from '../../types/user.types';
import type { RootState } from '../store';

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'https://smartfarm-server.onrender.com',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Users'],
  endpoints: (builder) => ({
    getUsers: builder.query<UsersResponse, UsersQueryParams>({
      query: (params) => ({
        url: '/users',
        params: {
          ...params,
          page: params?.page || 1,
          limit: params?.limit || 10,
        },
      }),
      providesTags: ['Users'],
    }),
    updateUser: builder.mutation<User, { id: number; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
  }),
});