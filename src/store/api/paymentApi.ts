import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { prod } from '../../utils/utils';

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

export interface TransactionDetails {
  success: boolean;
  data: Transaction & {
    order: {
      id: number;
      buyerId: number;
      listingId: number;
      quantity: string;
      totalPrice: string;
      orderStatus: string;
      paymentStatus: string;
      createdAt: string;
      updatedAt: string;
      listing: {
        id: number;
        product: {
          id: number;
          name: string;
          category: string;
          unit: string;
          imageUrl?: string;
        };
        farmer: {
          id: number;
          user: {
            id: number;
            name: string;
            email: string;
            phoneNumber: string;
          };
        };
      };
      buyer: {
        id: number;
        userId: number;
        companyName?: string;
        businessType?: string;
        user: {
          id: number;
          name: string;
          email: string;
          phoneNumber: string;
        };
      };
    };
  };
}

export interface TransactionStats {
  success: boolean;
  data: {
    totalTransactions: number;
    totalPaid: string;
    totalPending: string;
    totalFailed: string;
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
    baseUrl: prod,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Transactions', 'OrderTransactions', 'UserTransactions'],
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
              { type: 'OrderTransactions', id: result.data.transactionId },
              { type: 'UserTransactions' }
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

    // Get transactions for a specific user
    getUserTransactions: builder.query<TransactionsResponse, number>({
      query: (userId) => `/transactions/user/${userId}`,
      providesTags: (result) => 
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'UserTransactions' as const, id })),
              { type: 'UserTransactions', id: 'LIST' },
            ]
          : [{ type: 'UserTransactions', id: 'LIST' }],
    }),

    // Get detailed information for a specific transaction
    getTransactionDetails: builder.query<TransactionDetails, { id: number; userId: number }>({
      query: ({ id, userId }) => `/transaction/details/${id}/${userId}`,
      providesTags: (_, __, args) => [{ type: 'OrderTransactions', id: args.id }],
    }),

    // Get transaction statistics for a user
    getUserTransactionStats: builder.query<TransactionStats, number>({
      query: (userId) => `/transactions/stats/${userId}`,
      providesTags: [{ type: 'UserTransactions', id: 'STATS' }],
    }),
  }),
});

