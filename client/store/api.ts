import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { tags } from './apiTags';

const baseUrl = '/api/';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: baseUrl }),
  keepUnusedDataFor: 1, // Keep data in cache for 1 seconds after last use
  endpoints: () => ({}),
  tagTypes: tags, // Define tag types for cache
});
