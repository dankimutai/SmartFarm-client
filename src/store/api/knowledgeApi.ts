import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { 
  CreatePostRequest, 
  UpdatePostRequest, 
  PostsResponse,
  SinglePostResponse 
} from '../../types/knowledge.types';
import { RootState } from '../store';
import { prod } from '../../utils/utils';

export const knowledgeApi = createApi({
  reducerPath: 'knowledgeApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: prod,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      // Get token from auth state
      const token = (getState() as RootState).auth.token;
      
      if (token) {
        // Add token to Authorization header
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ['Posts'],
  endpoints: (builder) => ({
    // Get all posts with optional category filter
    getPosts: builder.query<PostsResponse, { category?: string }>({
      query: ({ category }) => ({
        url: '/posts',
        params: category ? { category } : undefined,
      }),
      providesTags: ['Posts'],
    }),

    // Get a single post by ID
    getPostById: builder.query<SinglePostResponse, number>({
      query: (id) => `/posts/${id}`,
      providesTags: (_, __, id) => [{ type: 'Posts', id }],
    }),

    // Create a new post
    createPost: builder.mutation<SinglePostResponse, CreatePostRequest>({
      query: (post) => ({
        url: '/posts',
        method: 'POST',
        body: post,
      }),
      invalidatesTags: ['Posts'],
    }),

    // Update an existing post
    updatePost: builder.mutation<SinglePostResponse, { id: number; post: UpdatePostRequest }>({
      query: ({ id, post }) => ({
        url: `/posts/${id}`,
        method: 'PUT',
        body: post,
      }),
      invalidatesTags: (_, __, { id }) => [
        'Posts',
        { type: 'Posts', id }
      ],
    }),

    // Delete a post
    deletePost: builder.mutation<void, number>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Posts'],
    }),

    // Get posts by category
    getPostsByCategory: builder.query<PostsResponse, string>({
      query: (category) => ({
        url: `/posts/category/${category}`,
      }),
      providesTags: ['Posts'],
    }),
  }),
});

