import { baseApi } from '@/store/api';
import { GetFull, GetIndex, PostType } from './users.model';
import { UserFormData } from '@/schemas/validations/users/user.schema';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<
      {
        data: {
          currentPage: number;
          items: Array<UserFormData & { id: string }>;
          pageSize: number;
          total: number;
          totalPages: number;
        };
      },
      { page: number; limit: number; search?: string }
    >({
      query: (params) => {
        const { page, limit, search } = params;
        let url = `users?page=${page}&limit=${limit}`;
        
        // Add search parameter if provided
        if (search && search.trim()) {
          url += `&search=${encodeURIComponent(search.trim())}`;
        }
        
        return url;
      },
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

export interface getUsers {
  data: {
    currentPage: number;
    items: Array<UserFormData & { id: string }>;
    pageSize: number;
    total: number;
    totalPages: number;
  };

  message: string[];
  statusCode: number;
  success: number;
}
