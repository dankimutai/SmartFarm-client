import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

interface Farmer {
  id: number;
  userId: number;
  location: string;
  farmSize: number;
  primaryCrops: string;
}

interface Buyer {
  id: number;
  userId: number;
  companyName: string | null;
  businessType: string | null;
}

interface Product {
  id: number;
  name: string;
  category: string;
  unit: string;
  imageUrl: string | null;
}

interface Listing {
  id: number;
  farmerId: number;
  productId: number;
  quantity: number;
  price: number;
  availableDate: string;
  status: 'active' | 'sold' | 'expired';
  createdAt: string;
  updatedAt: string;
  farmer: Farmer;
  product: Product;
}

interface Order {
  id: number;
  buyerId: number;
  listingId: number;
  quantity: string;
  totalPrice: string;
  orderStatus: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  updatedAt: string;
  buyer: Buyer;
  listing: Listing;
}

interface OrdersResponse {
  success: boolean;
  message: string;
  data: Order[];
}

interface OrderResponse {
  success: boolean;
  message: string;
  data: Order;
}

interface OrderUpdateData {
  orderStatus?: Order['orderStatus'];
  paymentStatus?: Order['paymentStatus'];
}

interface CreateOrderRequest {
  buyerId: number;
  listingId: number;
  quantity: number;
  totalPrice: number;
}

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
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
  tagTypes: ['Orders'],
  endpoints: (builder) => ({
    getOrders: builder.query<OrdersResponse, void>({
      query: () => '/orders',
      providesTags: (result) => 
        result?.data
          ? [
              ...result.data.map((order) => ({ type: 'Orders' as const, id: order.id })),
              { type: 'Orders', id: 'LIST' },
            ]
          : [{ type: 'Orders', id: 'LIST' }],
    }),

    getOrderById: builder.query<OrderResponse, number>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Orders', id }],
    }),

    getBuyerOrders: builder.query<OrdersResponse, number>({
      query: (buyerId) => `/orders/buyer/${buyerId}`,
      providesTags: (result) => 
        result?.data
          ? [
              ...result.data.map((order) => ({ type: 'Orders' as const, id: order.id })),
              { type: 'Orders', id: 'LIST' },
            ]
          : [{ type: 'Orders', id: 'LIST' }],
    }),

    getFarmerOrders: builder.query<OrdersResponse, number>({
      query: (farmerId) => `/orders/farmer/${farmerId}`,
      providesTags: (result) => 
        result?.data
          ? [
              ...result.data.map((order) => ({ type: 'Orders' as const, id: order.id })),
              { type: 'Orders', id: 'LIST' },
            ]
          : [{ type: 'Orders', id: 'LIST' }],
    }),

    createOrder: builder.mutation<OrderResponse, CreateOrderRequest>({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: {
          buyerId: orderData.buyerId,
          listingId: orderData.listingId,
          quantity: orderData.quantity,
          totalPrice: orderData.totalPrice
        },
      }),
      invalidatesTags: [{ type: 'Orders', id: 'LIST' }],
    }),

    updateOrder: builder.mutation<OrderResponse, { 
      id: number; 
      updateData: OrderUpdateData;
    }>({
      query: ({ id, updateData }) => ({
        url: `/orders/${id}`,
        method: 'PATCH',
        body: updateData,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Orders', id },
        { type: 'Orders', id: 'LIST' }
      ],
    }),

    cancelOrder: builder.mutation<OrderResponse, number>({
      query: (id) => ({
        url: `/orders/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Orders', id },
        { type: 'Orders', id: 'LIST' }
      ],
    }),
  }),
});

