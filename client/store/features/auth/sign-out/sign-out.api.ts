import { baseApi } from '@/store/api';
import { BaseResponse } from '../../base-response.model';
import { SignOutBody, SignOutResponse } from './sign-out.model';

export const signOutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    signOut: builder.mutation<BaseResponse<SignOutResponse>, SignOutBody>({
      query: (body) => ({
        url: 'auth/logout',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SignOut'],
    }),
  }),
});

export const { useSignOutMutation } = signOutApi;
