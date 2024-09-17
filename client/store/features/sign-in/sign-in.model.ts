import { SignInFormData } from '@/schemas/validations/auth/sign-in.schema';

export type SignInBody = SignInFormData;

export type SignInResponse = {
  access_token: string;
  cookie_expires_in: number;
};
