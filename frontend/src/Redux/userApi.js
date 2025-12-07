// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
// @ts-ignore
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
// Define a service using a base URL and expected endpoints
export const userApi = createApi({
  reducerPath: 'userApi',
  tagTypes: ['User'],
  baseQuery: fetchBaseQuery({ baseUrl: BACKEND_URL, credentials: 'include' }),
  endpoints: (builder) => ({
    getUserProfile: builder.query({
      query: () => `/api/profile`,
      providesTags: ['User'],
    }),
    // <--- هذا هو الجزء الذي يجب أن يكون موجودًا
    signin: builder.mutation({
      query: ({ email, password }) => ({
        url: '/api/signin',
        method: 'POST',
        body: { email, password },
      }),
      // invalidatesTags: ['User'],
    }),
    signup: builder.mutation({
      query: ({ fullName, email, password, confirmPassword }) => ({
        url: '/api/register',
        method: 'POST',
        body: { fullName, email, password, confirmPassword },
      }),
      // invalidatesTags: ['User'],
    }),
    signOut: builder.mutation({
      query: () => ({
        url: '/api/signout',
        method: 'POST',
      }),
      // invalidatesTags: ['User'],
    }),
  }),
});
export const { useGetUserProfileQuery, useSigninMutation,useSignupMutation, useSignOutMutation } = userApi

