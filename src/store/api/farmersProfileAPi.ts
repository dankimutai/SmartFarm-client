import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define types based on the actual API response structure
export interface FarmerResponse {
  name: string;
  email: string;
  phoneNumber: string;
  farmSize: number | null;
  primaryCrops: string | null;
  location: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Define the update payload type
export interface UpdateFarmerPayload {
    farmSize: string; 
    primaryCrops: string | null;
    location: string;
  }

// Create the API slice for farmer profile
export const farmersApi = createApi({
  reducerPath: 'farmersApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:8080', // Update with your actual API base URL
    prepareHeaders: (headers) => {
      // Add any required headers here
      return headers;
    },
  }),
  tagTypes: ['Farmer'],
  endpoints: (builder) => ({
    // Get farmer by user ID
    getFarmerByUserId: builder.query<FarmerResponse, number>({
      query: (userId) => `/farmers/${userId}`,
      transformResponse: (response: ApiResponse<FarmerResponse>) => response.data,
      providesTags: ['Farmer'],
    }),
    
    // Update farmer details
    updateFarmer: builder.mutation<FarmerResponse, { id: number, data: UpdateFarmerPayload }>({
      query: ({ id, data }) => ({
        url: `/farmers/${id}`,
        method: 'PUT', // Using PUT as per your router definition
        body: data,
      }),
      transformResponse: (response: ApiResponse<FarmerResponse>) => response.data,
      invalidatesTags: ['Farmer'],
    }),
  }),
});

