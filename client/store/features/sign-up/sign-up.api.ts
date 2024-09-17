import { baseApi } from '@/store/api';
import { SignUpBody, SignUpResponse } from './sign-up.model';
import { BaseResponse } from '../base-response.model';

export const signUpApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    signUp: builder.mutation<BaseResponse<SignUpResponse>, SignUpBody>({
      query: (newUser) => ({
        url: 'auth/register',
        method: 'POST',
        body: newUser,
      }),
      invalidatesTags: ['SignUp'],
    }),
  }),
});

export const { useSignUpMutation } = signUpApi;
