import { baseApi } from '@/store/api';
import { GetFull, GetIndex, PostType } from './users.model';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<GetIndex[], void>({
      query: () => 'users',
      providesTags: ['User'],
    }),
    getUserById: builder.query<GetFull, { id: number }>({
      query: ({ id }) => `posts/${id}`,
      providesTags: ['User'],
    }),
    createUser: builder.mutation<GetFull, PostType>({
      query: (newUser) => ({
        url: 'users',
        method: 'POST',
        body: newUser,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useGetUsersQuery, useGetUserByIdQuery, useCreateUserMutation } = userApi;
