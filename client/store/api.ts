import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = 'http://localhost/api/';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: baseUrl }),
  keepUnusedDataFor: 1, // Keep data in cache for 1 seconds after last use
  endpoints: () => ({}),
  tagTypes: ['User', 'SignIn', 'SignUp', 'SignOut'], // Define tag types for cache
});
