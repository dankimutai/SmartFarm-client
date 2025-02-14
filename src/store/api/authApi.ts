import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prodDomain } from '../../utils/authUtils';
import type { LoginCredentials, RegisterCredentials, AuthResponse } from '../../types/auth.types';

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: prodDomain,
        prepareHeaders: (headers, { getState: _getState }) => {
            // You can add common headers here
            headers.set('Content-Type', 'application/json');
            return headers;
        },
    }),
    endpoints: (builder) => ({
        login: builder.mutation<AuthResponse, LoginCredentials>({
            query: (credentials) => ({
                url: '/login',
                method: 'POST',
                body: credentials
            })
        }),
        register: builder.mutation<AuthResponse, RegisterCredentials>({
            query: (credentials) => ({
                url: '/register',
                method: 'POST',
                body: credentials
            })
        })
    })
});

export const { useLoginMutation, useRegisterMutation } = authApi;