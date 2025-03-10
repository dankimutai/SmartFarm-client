import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

// Define transaction types
export interface Transaction {
  id: number;
  orderId: number;
  amount: string;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'paid' | 'failed';
  providerTransactionId?: string;
  providerTransactionDate?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionsResponse {
  success: boolean;
  data: Transaction[];
  orderId?: number;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TransactionStatus {
  success: boolean;
  data: {
    id: number;
    status: 'pending' | 'paid' | 'failed';
    amount: string;
    createdAt: string;
    metadata?: Record<string, any>;
  };
}

export interface InitiatePaymentRequest {
  orderId: number;
  phoneNumber: string;  // Must be in format 254XXXXXXXXX
  amount: number;
}

export interface InitiatePaymentResponse {
  success: boolean;
  message: string;
  data: {
    transactionId: number;
    checkoutRequestId: string;
  };
  error?: {
    type: string;
    details: string;
  };
}

export interface TransactionsQueryParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'paid' | 'failed';
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'amount' | 'status' | 'paymentMethod' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  paymentMethod?: string;
}

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
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
  tagTypes: ['Transactions', 'OrderTransactions'],
  endpoints: (builder) => ({
    // Initiate M-Pesa payment
    initiatePayment: builder.mutation<InitiatePaymentResponse, InitiatePaymentRequest>({
      query: (paymentData) => ({
        url: '/mpesa/initiate',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: (result) => 
        result?.success 
          ? [
              { type: 'Transactions' },
              { type: 'OrderTransactions', id: result.data.transactionId }
            ]
          : [],
    }),

    // Get transaction status - updated endpoint
    getTransactionStatus: builder.query<TransactionStatus, number>({
      query: (id) => `/transaction/status/${id}`,
      providesTags: (_, __, id) => [{ type: 'OrderTransactions', id }],
    }),

    // Get transactions for a specific order - updated endpoint
    getOrderTransactions: builder.query<TransactionsResponse, number>({
      query: (orderId) => `/transaction/order/${orderId}`,
      providesTags: (result) => 
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'OrderTransactions' as const, id })),
              { type: 'OrderTransactions', id: 'LIST' },
            ]
          : [{ type: 'OrderTransactions', id: 'LIST' }],
    }),

    // Get all transactions with filtering
    getAllTransactions: builder.query<TransactionsResponse, TransactionsQueryParams>({
      query: (params) => ({
        url: '/transactions',
        params: {
          ...params,
          page: params?.page || 1,
          limit: params?.limit || 10,
        },
      }),
      providesTags: (result) => 
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Transactions' as const, id })),
              { type: 'Transactions', id: 'LIST' },
            ]
          : [{ type: 'Transactions', id: 'LIST' }],
    }),
  }),
});