import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

interface Product {
  id: number;
  name: string;
  category: string;
  unit: string;
  imageUrl: string;
  listings: {
    id: number;
    quantity: number;
    price: number;
    availableDate: string;
    status: string;
  }[];
}

interface ProductsResponse {
  success: boolean;
  data: Product[];
  total: number;
  page: number;
  totalPages: number;
}

interface ProductsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:8080',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Products'],
  endpoints: (builder) => ({
    getProducts: builder.query<ProductsResponse, ProductsQueryParams>({
      query: (params) => ({
        url: '/products/with-listings',
        params: {
          ...params,
          page: params?.page || 1,
          limit: params?.limit || 10,
        },
      }),
      providesTags: ['Products'],
    }),
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products'],
    }),
    updateProduct: builder.mutation<Product, { id: number; data: Partial<Product> }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Products'],
    }),
  }),
});

