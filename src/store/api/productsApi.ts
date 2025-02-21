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
    quantity: string;
    price: string;
    availableDate: string;
    status: string;
  }[];
}

interface FarmerListing {
  id: number;
  productId: number;
  quantity: string;
  price: string;
  availableDate: string;
  status: 'active' | 'sold' | 'expired';
  createdAt: string;
  updatedAt: string;
  product: {
    id: number;
    name: string;
    category: string;
    unit: string;
    imageUrl: string | null;
  };
}

interface FarmerListingsResponse {
  success: boolean;
  data: FarmerListing[];
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
  tagTypes: ['Products', 'FarmerListings'],
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

    getFarmerListings: builder.query<FarmerListingsResponse, number>({
      query: (farmerId) => ({
        url: `/listings/farmer/${farmerId}`,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'FarmerListings' as const, id })),
              { type: 'FarmerListings', id: 'LIST' },
            ]
          : [{ type: 'FarmerListings', id: 'LIST' }],
    }),
    
    getFarmerByUserId: builder.query<{ id: number; userId: number }, number>({
      query: (userId) => `/farmers${userId}`,
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
    
    // Add product mutation - updated to match backend expectations
    addProduct: builder.mutation<
      { success: boolean; data: Product; error?: string },
      Omit<Product, 'id' | 'listings'>
    >({
      query: (productData) => ({
        url: '/products',
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: ['Products', 'FarmerListings'],
    }),
    
    // Add listing mutation - updated to use string types for quantity and price
    addListing: builder.mutation<
      { success: boolean; data: FarmerListing; error?: string },
      {
        farmerId: number;
        productId: number;
        quantity: string;  // Changed from number to string
        price: string;     // Changed from number to string
        availableDate: string;
        status?: 'active' | 'sold' | 'expired';
      }
    >({
      query: (listingData) => ({
        url: '/listings',
        method: 'POST',
        body: listingData,
      }),
      invalidatesTags: (result) => 
        result?.success 
          ? [
              { type: 'Products' },
              { type: 'FarmerListings', id: 'LIST' },
              { type: 'FarmerListings', id: result.data.id }
            ] 
          : ['Products', 'FarmerListings'],
    }),

    // New mutation for updating listing status
    updateListingStatus: builder.mutation<
      { success: boolean; data: FarmerListing; error?: string },
      { id: number; status: 'active' | 'sold' | 'expired' }
    >({
      query: ({ id, status }) => ({
        url: `/listings/${id}`,
        method: 'PATCH',
        body: { status }
      }),
      invalidatesTags: (result) => 
        result?.success 
          ? [
              { type: 'Products' },
              { type: 'FarmerListings', id: 'LIST' },
              { type: 'FarmerListings', id: result.data.id }
            ] 
          : ['Products', 'FarmerListings'],
    }),
deleteListing: builder.mutation<
  { success: boolean; message: string; error?: string },
  number // listing id
>({
  query: (id) => ({
    url: `/listings/${id}`,
    method: 'DELETE',
  }),
  invalidatesTags: (result) => 
    result?.success 
      ? [
          { type: 'Products' },
          { type: 'FarmerListings', id: 'LIST' }
        ] 
      : ['Products', 'FarmerListings'],
}),
  }),
});