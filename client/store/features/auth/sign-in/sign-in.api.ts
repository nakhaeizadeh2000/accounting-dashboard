import { baseApi } from '@/store/api';
import { SignInBody, SignInResponse } from './sign-in.model';
import { BaseResponse } from '../../base-response.model';

export const signInApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    signIn: builder.mutation<BaseResponse<SignInResponse>, SignInBody>({
      query: (newUser) => ({
        url: 'auth/login',
        method: 'POST',
        body: newUser,
      }),
      invalidatesTags: ['SignIn'],
    }),
  }),
});

export const { useSignInMutation } = signInApi;
