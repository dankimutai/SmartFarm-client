import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ListingsResponse, ListingsQueryParams,SingleListingResponse } from '../../types/marketplace.types';
import { prod } from '../../utils/utils';

export const marketplaceApi = createApi({
  reducerPath: 'marketplaceApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl:prod,
  }),
  endpoints: (builder) => ({
    getListings: builder.query<ListingsResponse, ListingsQueryParams | void>({
      query: (params) => ({
        url: '/listings',
        params: {
          ...params,
          page: params?.page || 1,
          limit: params?.limit || 30,
        },
      }),
    }),
    getListingById: builder.query<SingleListingResponse, number>({
      query: (id) => `/listings/${id}`,
    }),
  }),
});

