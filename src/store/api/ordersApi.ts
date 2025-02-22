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

interface OrderUpdateData {
  orderStatus?: Order['orderStatus'];
  paymentStatus?: Order['paymentStatus'];
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
    getOrders: builder.query<Order[], void>({
      query: () => '/orders',
      providesTags: ['Orders'],
    }),

    getOrderById: builder.query<Order, number>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Orders', id }],
    }),
     // Fixed farmer orders endpoint
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


    updateOrder: builder.mutation<Order, { 
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
  }),
});

